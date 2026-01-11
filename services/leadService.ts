
import { Lead, PipelineStage } from '../types';
import { metaCapiService, sha256 } from './metaCapiService';
import { emailService } from './emailService';
import { funnelService } from './funnelService';

const API_URL = '/api/nile';

const apiCall = async (action: string, data?: any, id?: string) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collection: 'leads', action, data, id })
  });
  if (!response.ok) throw new Error('DB Error');
  return response.json();
};

export const leadService = {
  subscribe: async (email: string, source: string, name?: string, phone?: string): Promise<void> => {
    const normalizedEmail = email.trim().toLowerCase();
    const externalId = await sha256(normalizedEmail);
    
    const leadData: Lead = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      name: name || '',
      phone: phone || '',
      externalId: externalId,
      source: source,
      status: 'active',
      pipelineStage: 'new',
      tags: [],
      createdAt: new Date().toISOString()
    };

    // Upsert via API
    await apiCall('create', leadData);

    // Async tasks
    try {
        metaCapiService.sendMetaEvent('Lead', { 
          content_name: 'Nova Assinatura Newsletter', 
          content_category: 'Geração de Lead' 
        }, crypto.randomUUID(), externalId).catch(console.error);

        emailService.sendWelcome(normalizedEmail, name || normalizedEmail.split('@')[0]).catch(console.error);
        funnelService.triggerFunnel('lead_subscribed', leadData).catch(console.error);
    } catch (e) {
        console.error("Erro background tasks:", e);
    }
  },

  getAllLeads: async (): Promise<Lead[]> => {
    return apiCall('getAll');
  },

  updateStage: async (leadId: string, newStage: PipelineStage): Promise<void> => {
    // Optimistic update implied, but here we just send to DB
    // First, we need to get current lead to check externalId for CAPI, but to keep it fast we might skip or fetch first.
    // For this implementation, we simply update.
    await apiCall('update', { pipelineStage: newStage }, leadId);
    
    // Note: CAPI events ideally should be fired, but without the full lead object we can't get externalId easily without a fetch.
    // Assuming the frontend passes full object or we fetch. For now, simple DB update.
  },

  updateLead: async (leadId: string, updates: Partial<Lead>): Promise<Lead> => {
    await apiCall('update', updates, leadId);
    return { id: leadId, ...updates } as Lead; // Return optimistic
  },

  addTag: async (leadId: string, tag: string): Promise<void> => {
    // This is tricky without fetching first. 
    // In a real app, backend handles "append to array".
    // For now, we will assume we have the lead in the frontend context, 
    // but here in service we'll fetch-update pattern.
    const leads = await leadService.getAllLeads();
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
       const newTags = [...(lead.tags || [])];
       if (!newTags.includes(tag)) {
           newTags.push(tag);
           await apiCall('update', { tags: newTags }, leadId);
           funnelService.triggerFunnel(`tag_added:${tag}`, lead).catch(console.error);
       }
    }
  }
};
