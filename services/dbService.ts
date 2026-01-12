import { BlogPost, PostStatus, IntegrationSettings, ThemeSettings, Lead, Funnel, FunnelExecution, WhatsAppMessageTemplate } from '../types';

const API_URL = '/api/nile';

// --- API Service ---
const apiCall = async (collection: string, action: string, data?: any, id?: string): Promise<any> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collection, action, data, id })
  });
  
  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.error || 'API call failed');
  }
  return responseData;
};

export const dbService = {
  checkConnection: async (): Promise<any> => {
    return apiCall('system', 'check_connection');
  },

  runMigration: async (): Promise<{success: boolean, logs: string[], error?: string}> => {
    return apiCall('system', 'run_migration');
  },

  getAllPosts: async (): Promise<BlogPost[]> => {
    const posts = await apiCall('posts', 'getAll');
    return Array.isArray(posts) ? posts : [];
  },

  getPublishedPosts: async (): Promise<BlogPost[]> => {
    const posts = await dbService.getAllPosts();
    return posts.filter(p => p.status === PostStatus.PUBLISHED);
  },

  getPostBySlug: async (slug: string): Promise<BlogPost | undefined> => {
    const posts = await dbService.getAllPosts(); // Client-side filter for simplicity
    return posts.find(p => p.slug === slug);
  },

  getPostById: async (id: string): Promise<BlogPost | undefined> => {
    return apiCall('posts', 'getById', undefined, id);
  },

  createPost: async (post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ post: BlogPost, synced: boolean }> => {
    const newPost = await apiCall('posts', 'create', post);
    return { post: newPost, synced: true };
  },

  updatePost: async (id: string, updates: Partial<BlogPost>): Promise<{ success: boolean, synced: boolean }> => {
    await apiCall('posts', 'update', updates, id);
    return { success: true, synced: true };
  },

  deletePost: async (id: string): Promise<void> => {
    await apiCall('posts', 'delete', undefined, id);
  },

  getSettings: async (): Promise<IntegrationSettings> => {
    const data = await apiCall('app_data', 'get', { key: 'cms_settings' });
    return {
      googleAnalyticsId: '', googleAdSenseId: '', facebookPixelId: '', metaAccessToken: '',
      siteUrl: '', googleSearchConsoleCode: '', metaWhatsappToken: '', metaPhoneId: '',
      metaBusinessId: '', evolutionApiUrl: '', evolutionApiKey: '', evolutionInstanceName: '',
      whatsappAdminNumber: '', resendApiKey: '', resendFromEmail: '',
      postgresUrl: '', clerkPublishableKey: '', clerkSecretKey: '',
      ...data
    };
  },

  updateSettings: async (settings: IntegrationSettings): Promise<void> => {
    await apiCall('app_data', 'set', { key: 'cms_settings', data: settings });
  },

  getTheme: async (): Promise<ThemeSettings> => {
    const data = await apiCall('app_data', 'get', { key: 'cms_theme' });
    return { primaryColor: '#4f46e5', secondaryColor: '#1e3a8a', logoUrl: '', siteName: 'AI CMS Platform', ...data };
  },

  updateTheme: async (settings: ThemeSettings): Promise<void> => {
    await apiCall('app_data', 'set', { key: 'cms_theme', data: settings });
  }
};