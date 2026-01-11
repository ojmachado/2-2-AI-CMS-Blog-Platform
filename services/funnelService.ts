
import { Funnel, FunnelExecution, FunnelNode, Lead } from '../types';
import { emailService } from './emailService';
import { whatsappService } from './whatsappService';
import { v4 as uuidv4 } from 'uuid';

const API_URL = '/api/nile';

const apiCall = async (collection: string, action: string, data?: any, id?: string) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collection, action, data, id })
  });
  if (!response.ok) throw new Error('DB Error');
  return response.json();
};

export const funnelService = {
  
  getAllFunnels: async (): Promise<Funnel[]> => {
    return apiCall('funnels', 'getAll');
  },

  saveFunnel: async (funnel: Funnel): Promise<void> => {
    // Check if exists to decide create vs update, or use Upsert logic if API supports it.
    // Our API 'create' uses INSERT, 'update' uses UPDATE. 
    // To keep it simple, we can try update, if fails/count 0, create? 
    // Or just check ID existence via getAll (cached).
    // Better: API 'create' usually implies new.
    // Let's check if it exists in the list first.
    const all = await funnelService.getAllFunnels();
    const exists = all.find(f => f.id === funnel.id);
    
    if (exists) {
        await apiCall('funnels', 'update', funnel, funnel.id);
    } else {
        await apiCall('funnels', 'create', funnel);
    }
  },

  deleteFunnel: async (id: string): Promise<void> => {
    await apiCall('funnels', 'delete', undefined, id);
  },

  createDefaultPostUpdateFunnel: async (): Promise<Funnel> => {
    const waTemplateId = uuidv4();
    const whatsappNodeId = uuidv4();
    const delayNodeId = uuidv4();
    const emailNodeId = uuidv4();

    await whatsappService.saveInternalTemplate({
        id: waTemplateId,
        title: 'Notificação: Novo Post',
        content: '🚀 *Novidade no Blog!*\n\nAcabei de publicar o artigo: "{{post_title}}"\n\nConfira agora mesmo: {{post_url}}',
        type: 'text'
    });

    const funnel: Funnel = {
        id: uuidv4(),
        name: 'Automação: Distribuição de Novos Posts',
        trigger: 'new_post_published',
        isActive: true,
        nodes: [
            {
                id: whatsappNodeId,
                type: 'WHATSAPP',
                position: { x: 100, y: 150 },
                data: { waTemplateId, waTemplateTitle: 'WA: Alerta Post', customTitle: 'Zap: Novo Post' },
                nextNodeId: delayNodeId
            },
            {
                id: delayNodeId,
                type: 'DELAY',
                position: { x: 350, y: 150 },
                data: { hours: 24, customTitle: 'Aguardar 24h' },
                nextNodeId: emailNodeId
            },
            {
                id: emailNodeId,
                type: 'EMAIL',
                position: { x: 600, y: 150 },
                data: {
                    subject: '🔥 Novo conteúdo: {{post_title}}',
                    content: 'Olá {{name}}, tem post novo no blog: <a href="{{post_url}}">{{post_title}}</a>',
                    customTitle: 'Email: Novo Post'
                },
                nextNodeId: null
            }
        ],
        startNodeId: whatsappNodeId
    };

    await funnelService.saveFunnel(funnel);
    return funnel;
  },

  triggerGlobalFunnel: async (trigger: string, contextData?: Record<string, string>) => {
    const { leadService } = await import('./leadService');
    const allLeads = await leadService.getAllLeads();
    const activeLeads = allLeads.filter(l => l.status === 'active');
    
    for (const lead of activeLeads) {
      await funnelService.triggerFunnel(trigger, lead, contextData);
    }
  },

  triggerFunnel: async (trigger: string, lead: Lead, contextData?: Record<string, string>) => {
    const funnels = await funnelService.getAllFunnels();
    const matchingFunnels = funnels.filter(f => f.isActive && f.trigger === trigger);

    if (matchingFunnels.length === 0) return;

    for (const funnel of matchingFunnels) {
      if (!funnel.nodes.length || !funnel.startNodeId) continue;

      const execution: FunnelExecution = {
        id: uuidv4(),
        funnelId: funnel.id,
        leadId: lead.id,
        currentNodeId: funnel.startNodeId,
        status: 'waiting',
        nextRunAt: new Date().toISOString(),
        history: [],
        context: contextData
      };

      await apiCall('funnel_executions', 'create', execution);
    }
    
    // Trigger immediate processing check
    await funnelService.processExecutions();
  },

  processExecutions: async () => {
    const { leadService } = await import('./leadService');
    const executions: FunnelExecution[] = await apiCall('funnel_executions', 'getAll');
    const funnels = await funnelService.getAllFunnels();
    const leads = await leadService.getAllLeads();
    const now = new Date();

    for (const exec of executions) {
      if (exec.status === 'completed') continue;
      
      if (new Date(exec.nextRunAt) > now) continue;

      const funnel = funnels.find(f => f.id === exec.funnelId);
      const lead = leads.find(l => l.id === exec.leadId);

      if (!funnel || !lead) {
        await apiCall('funnel_executions', 'update', { status: 'completed' }, exec.id);
        continue;
      }

      let currentNodeId: string | null | undefined = exec.currentNodeId;
      let nextRunAt = exec.nextRunAt;
      
      while (currentNodeId) {
        const node = funnel.nodes.find(n => n.id === currentNodeId);
        if (!node) break;

        // Logic for WA Time Windows
        if (node.type === 'WHATSAPP' && node.data.sendTime) {
            const [hours, minutes] = node.data.sendTime.split(':').map(Number);
            const targetTime = new Date();
            targetTime.setHours(hours, minutes, 0, 0);

            if (targetTime < now) {
                targetTime.setDate(targetTime.getDate() + 1);
            }

            if (Math.abs(new Date(nextRunAt).getTime() - targetTime.getTime()) > 60000) {
                // Schedule for later
                await apiCall('funnel_executions', 'update', { nextRunAt: targetTime.toISOString() }, exec.id);
                return; // Stop processing this execution for now
            }
        }

        const replace = (t: string) => {
            let r = t;
            if (exec.context) Object.entries(exec.context).forEach(([k, v]) => r = r.replace(new RegExp(`{{${k}}}`, 'g'), v as string));
            return r.replace(/{{name}}/g, lead.name || 'Leitor').replace(/{{email}}/g, lead.email);
        };

        try {
            if (node.type === 'EMAIL' && node.data.subject && node.data.content) {
                await emailService.sendManualNotification(lead.email, replace(node.data.subject), replace(node.data.content));
                currentNodeId = node.nextNodeId;
            } else if (node.type === 'WHATSAPP' && lead.phone && node.data.waTemplateId) {
                const tpl = await whatsappService.getInternalTemplateById(node.data.waTemplateId);
                if (tpl) await whatsappService.sendHybridMessage({
                    to: lead.phone,
                    templateName: 'FORCE_FALLBACK',
                    variables: [],
                    fallbackText: replace(tpl.content)
                });
                currentNodeId = node.nextNodeId;
            } else if (node.type === 'DELAY') {
                const hours = node.data.hours || 24;
                const nextRun = new Date();
                nextRun.setHours(nextRun.getHours() + hours);
                
                // Update DB with delay and stop
                await apiCall('funnel_executions', 'update', { 
                    currentNodeId: node.nextNodeId, 
                    nextRunAt: nextRun.toISOString() 
                }, exec.id);
                return; // Stop loop
            } else if (node.type === 'CONDITION') {
                const target = node.data.conditionTarget || 'tags';
                const operator = node.data.conditionOperator || 'contains';
                const value = node.data.conditionValue || '';
                
                let result = false;
                if (target === 'tags') {
                    const leadTags = lead.tags || [];
                    result = operator === 'contains' 
                        ? leadTags.includes(value) 
                        : !leadTags.includes(value);
                }
                
                currentNodeId = result ? node.trueNodeId : node.falseNodeId;
            } else {
                currentNodeId = node.nextNodeId;
            }
        } catch (e) { break; }
      }

      // If loop finishes (no delay), mark completed
      await apiCall('funnel_executions', 'update', { 
          status: 'completed', 
          currentNodeId: null 
      }, exec.id);
    }
  }
};
