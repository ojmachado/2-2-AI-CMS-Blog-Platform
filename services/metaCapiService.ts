import { dbService } from './dbService';

// Interfaces for CAPI
interface MetaUserData {
  em?: string[]; // Email (hashed)
  ph?: string[]; // Phone (hashed)
  client_ip_address: string;
  client_user_agent: string;
  fbc?: string;
  fbp?: string;
  external_id?: string[]; // SHA-256 Hashed External ID
}

interface MetaCustomData {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
}

interface MetaEvent {
  event_name: string;
  event_time: number;
  action_source: string;
  event_source_url: string;
  user_data: MetaUserData;
  custom_data?: MetaCustomData;
  event_id?: string;
}

// Helper: SHA-256 Hashing
// Exporting this so leadService can use it too
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper: Get Cookie value
function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}

// Helper: Fetch IP Address (Client-side workaround)
async function getClientIp(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('Failed to fetch IP for CAPI', error);
    return '0.0.0.0'; // Fallback
  }
}

export const metaCapiService = {
  /**
   * Sends an event to Meta Conversions API
   */
  sendMetaEvent: async (
    eventName: string,
    customData?: MetaCustomData,
    eventId?: string,
    externalId?: string // Hashed external ID
  ) => {
    try {
      const settings = await dbService.getSettings();
      
      if (!settings.facebookPixelId || !settings.metaAccessToken) {
        console.log('[Meta CAPI] Skipping: Missing Pixel ID or Access Token');
        return;
      }

      const ip = await getClientIp();
      const eventTime = Math.floor(Date.now() / 1000);
      
      const userData: MetaUserData = {
        client_ip_address: ip,
        client_user_agent: navigator.userAgent,
        fbp: getCookie('_fbp'),
        fbc: getCookie('_fbc'),
      };

      if (externalId) {
          userData.external_id = [externalId];
          // We also map externalId to 'em' (email hash) if it looks like one, 
          // but strictly speaking external_id is a separate field in CAPI. 
          // For simplicity in this codebase, we assume externalId PASSED IN is already the hashed email.
          userData.em = [externalId]; 
      }

      // Construct payload
      const payload = {
        data: [
          {
            event_name: eventName,
            event_time: eventTime,
            action_source: 'website',
            event_source_url: window.location.href,
            event_id: eventId,
            user_data: userData,
            custom_data: customData,
          } as MetaEvent
        ]
      };

      // Send to Graph API
      // Version v19.0 as per instructions
      const url = `https://graph.facebook.com/v19.0/${settings.facebookPixelId}/events?access_token=${settings.metaAccessToken}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      if (result.events_received) {
        console.log(`[Meta CAPI] Event '${eventName}' sent successfully.`, result);
      } else {
        console.warn(`[Meta CAPI] Warning:`, result);
      }

    } catch (error) {
      console.error('[Meta CAPI] Error sending event:', error);
    }
  },

  /**
   * Specific helper for ViewContent
   */
  sendViewContent: async (postTitle: string, postSlug: string) => {
    // Deduplication ID: Slug + Timestamp (rough approximation for client-side demo)
    // In production, sync this ID with the Pixel event ID
    const eventId = `view_${postSlug}_${Date.now()}`;
    
    await metaCapiService.sendMetaEvent(
      'ViewContent',
      {
        content_name: postTitle,
        content_category: 'Blog Post',
        content_ids: [postSlug],
        content_type: 'product', // 'product' is often used for generic content items
      },
      eventId
    );
  }
};