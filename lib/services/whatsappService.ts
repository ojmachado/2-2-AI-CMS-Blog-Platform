interface WhatsappMessage {
  to: string;
  templateName?: string; // Para Meta
  variables?: string[];  // Para Meta
  text: string;          // Para Evolution (Fallback)
}

export const whatsappService = {
  async send(msg: WhatsappMessage) {
    const { to, templateName, variables, text } = msg;
    const cleanPhone = to.replace(/\D/g, '');

    // 1. Tentar META OFFICIAL API
    if (templateName && process.env.META_WA_TOKEN) {
      try {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${process.env.META_WA_PHONE_ID}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.META_WA_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: cleanPhone,
              type: 'template',
              template: {
                name: templateName,
                language: { code: 'pt_BR' },
                components: [
                  {
                    type: 'body',
                    parameters: variables?.map(v => ({ type: 'text', text: v })) || []
                  }
                ]
              },
            }),
          }
        );

        if (response.ok) return { success: true, provider: 'META' };
        console.warn('Meta API Failed, switching to fallback...');
      } catch (e) {
        console.error('Meta API Error:', e);
      }
    }

    // 2. Fallback: EVOLUTION API
    if (process.env.EVOLUTION_API_URL) {
      try {
        const response = await fetch(
          `${process.env.EVOLUTION_API_URL}/message/sendText/${process.env.EVOLUTION_INSTANCE}`,
          {
            method: 'POST',
            headers: {
              'apikey': process.env.EVOLUTION_API_KEY || '',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              number: cleanPhone,
              options: {
                delay: 1200,
                presence: 'composing',
              },
              textMessage: {
                text: text
              }
            }),
          }
        );

        if (response.ok) return { success: true, provider: 'EVOLUTION' };
      } catch (e) {
        console.error('Evolution API Error:', e);
      }
    }

    return { success: false, error: 'All providers failed' };
  }
};