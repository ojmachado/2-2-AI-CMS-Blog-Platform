
import { dbService } from './dbService';
import { IntegrationSettings, WhatsAppTemplate, WhatsAppMessageTemplate } from '../types';

const API_URL = '/api/nile';

const apiCall = async (collection: string, action: string, data?: any) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collection, action, data })
  });
  if (!response.ok) return []; // Fail graceful
  return response.json();
};

interface HybridMessageParams {
  to: string;
  templateName: string; // Para Meta
  variables: string[]; // Para Meta
  fallbackText: string; // Para Evolution
  language?: string;
}

// Templates Padrão para Demonstração (Simulação Meta)
export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    name: 'hello_world',
    label: 'Boas-vindas (Teste)',
    category: 'UTILITY',
    variables: [],
    previewText: 'Olá! Esta é uma mensagem de teste do seu novo portal de notícias.'
  },
  {
    name: 'alerta_novo_post',
    label: 'Alerta de Novo Artigo',
    category: 'MARKETING',
    variables: ['{{1}}'],
    previewText: '🔥 Acabamos de publicar: {{1}}. Confira agora no nosso blog!'
  },
  {
    name: 'boas_vindas_lead',
    label: 'Boas-vindas Newsletter',
    category: 'MARKETING',
    variables: ['{{1}}'],
    previewText: 'Olá {{1}}, obrigado por se inscrever! Fique por dentro das novidades de IA.'
  }
];

export const whatsappService = {
  getTemplates: (): WhatsAppTemplate[] => {
    return WHATSAPP_TEMPLATES;
  },

  saveInternalTemplate: async (template: WhatsAppMessageTemplate): Promise<void> => {
      // Saves to 'templates' table
      await apiCall('templates', 'create', {
          ...template,
          type: 'whatsapp',
          category: 'internal'
      });
  },

  getInternalTemplates: async (): Promise<WhatsAppMessageTemplate[]> => {
      const templates = await apiCall('templates', 'getAll');
      return templates.filter((t: any) => t.type === 'whatsapp');
  },

  getInternalTemplateById: async (id: string): Promise<WhatsAppMessageTemplate | undefined> => {
      const list = await whatsappService.getInternalTemplates();
      return list.find(t => t.id === id);
  },

  /**
   * Envio Híbrido Orchestrator
   */
  sendHybridMessage: async (params: HybridMessageParams): Promise<boolean> => {
    const settings = await dbService.getSettings();
    const cleanNumber = params.to.replace(/\D/g, '');

    if (!cleanNumber) return false;

    // 1. Tentar Canal Primário: Meta Cloud API (Oficial)
    try {
      if (!settings.metaWhatsappToken || !settings.metaPhoneId) throw new Error("Meta creds missing");
      
      await whatsappService._sendViaMeta(settings, cleanNumber, params.templateName, params.variables, params.language);
      return true;
    } catch (metaError) {
      console.warn(`[WA Híbrido] Canal Meta falhou, tentando fallback...`, metaError);
      
      // 2. Tentar Canal de Fallback: Evolution API
      try {
         if (!settings.evolutionApiUrl) return false;
         await whatsappService._sendViaEvolution(settings, cleanNumber, params.fallbackText);
         return true;
      } catch (evoError) {
         console.error(`[WA Híbrido] Todos os canais falharam.`, evoError);
         return false;
      }
    }
  },

  /**
   * Envio de mensagens em massa (Bulk Send)
   */
  sendBulkMessage: async (
    recipients: string[],
    templateName: string,
    variables: string[],
    fallbackText: string,
    onProgress: (current: number, total: number) => void
  ): Promise<number> => {
    let successCount = 0;
    const total = recipients.length;
    
    for (let i = 0; i < total; i++) {
      const recipient = recipients[i];
      const success = await whatsappService.sendHybridMessage({
        to: recipient,
        templateName,
        variables,
        fallbackText
      });
      if (success) successCount++;
      onProgress(i + 1, total);
    }
    
    return successCount;
  },

  _sendViaMeta: async (settings: IntegrationSettings, to: string, templateName: string, variables: string[], language: string = 'pt_BR'): Promise<void> => {
    const url = `https://graph.facebook.com/v19.0/${settings.metaPhoneId}/messages`;
    const payload = {
      messaging_product: "whatsapp",
      to: to,
      type: "template",
      template: {
        name: templateName,
        language: { code: language },
        components: variables.length > 0 ? [{
          type: "body",
          parameters: variables.map(v => ({ type: "text", text: v }))
        }] : []
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.metaWhatsappToken}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(await response.text());
  },

  _sendViaEvolution: async (settings: IntegrationSettings, to: string, text: string): Promise<void> => {
    const url = `${settings.evolutionApiUrl}/message/sendText/${settings.evolutionInstanceName}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': settings.evolutionApiKey
      },
      body: JSON.stringify({
        number: to,
        text: text,
        delay: 1000,
        linkPreview: true
      })
    });

    if (!response.ok) throw new Error(await response.text());
  },

  notifyAdmin: async (postTitle: string): Promise<void> => {
      const settings = await dbService.getSettings();
      if (settings.whatsappAdminNumber) {
          await whatsappService.sendHybridMessage({
              to: settings.whatsappAdminNumber,
              templateName: 'alerta_novo_post',
              variables: [postTitle],
              fallbackText: `🤖 *Novo Post Gerado!*\n\n*Título:* ${postTitle}\n\nAcesse o painel para revisar.`
          });
      }
  }
};
