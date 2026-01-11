import crypto from 'crypto';

interface CapiEvent {
  eventName: string;
  email: string;
  phone?: string;
  sourceUrl: string;
  data?: any;
}

const hashData = (data: string) => {
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
};

export const sendMetaEvent = async ({ eventName, email, phone, sourceUrl, data }: CapiEvent) => {
  const PIXEL_ID = process.env.META_PIXEL_ID;
  const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

  if (!PIXEL_ID || !ACCESS_TOKEN) return;

  const userData = {
    em: [hashData(email)],
    ph: phone ? [hashData(phone)] : undefined,
    client_ip_address: '0.0.0.0', // Em produção, pegar dos headers da request
    client_user_agent: 'Server Side API', // Em produção, pegar dos headers
  };

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: sourceUrl,
        user_data: userData,
        custom_data: data,
      },
    ],
  };

  try {
    await fetch(`https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Meta CAPI Error:', error);
  }
};