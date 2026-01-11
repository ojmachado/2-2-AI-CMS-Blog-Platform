import { BlogPost, PostStatus, IntegrationSettings, ThemeSettings, Lead, Funnel, FunnelExecution, WhatsAppMessageTemplate } from '../types';

// --- Local Storage Service ---
const getLocal = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const setLocal = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error setting localStorage key “${key}”:`, error);
  }
};

const LOCAL_KEYS = {
  posts: 'cms_posts',
  settings: 'cms_settings',
  theme: 'cms_theme',
  leads: 'cms_leads',
  funnels: 'cms_funnels',
  funnelExecutions: 'cms_funnel_executions',
  templates: 'cms_templates',
};

const localApiCall = async (collection: string, action: string, data?: any, id?: string): Promise<any> => {
  // Simulates backend logic using localStorage
  switch (collection) {
    case 'posts': {
      const posts = getLocal<BlogPost[]>(LOCAL_KEYS.posts, []);
      if (action === 'getAll') {
        return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (action === 'create') {
        const { id: newId, ...postData } = data;
        const newPost = { id: newId || crypto.randomUUID(), ...postData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setLocal(LOCAL_KEYS.posts, [...posts, newPost]);
        return { success: true };
      } else if (action === 'update') {
        const updatedPosts = posts.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p);
        if (posts.findIndex(p => p.id === id) === -1) return { success: false, error: 'record_not_found' };
        setLocal(LOCAL_KEYS.posts, updatedPosts);
        return { success: true };
      } else if (action === 'delete') {
        setLocal(LOCAL_KEYS.posts, posts.filter(p => p.id !== id));
        return { success: true };
      }
      break;
    }
    case 'leads': {
      const leads = getLocal<Lead[]>(LOCAL_KEYS.leads, []);
      if (action === 'getAll') return leads;
      if (action === 'create') {
        const existingIndex = leads.findIndex(l => l.email === data.email);
        if (existingIndex > -1) {
          leads[existingIndex] = { ...leads[existingIndex], ...data, updatedAt: new Date().toISOString() };
        } else {
          leads.push(data);
        }
        setLocal(LOCAL_KEYS.leads, leads);
        return { success: true };
      }
      if (action === 'update') {
        const updatedLeads = leads.map(l => l.id === id ? { ...l, ...data } : l);
        setLocal(LOCAL_KEYS.leads, updatedLeads);
        return { success: true };
      }
      break;
    }
    case 'cms_config':
    case 'cms_theme': {
        if (action === 'get') {
            const key = collection === 'cms_config' ? LOCAL_KEYS.settings : LOCAL_KEYS.theme;
            return getLocal(key, {});
        } else if (action === 'set') {
            const key = collection === 'cms_config' ? LOCAL_KEYS.settings : LOCAL_KEYS.theme;
            setLocal(key, data);
            return { success: true };
        }
        break;
    }
    case 'funnels': {
        const funnels = getLocal<Funnel[]>(LOCAL_KEYS.funnels, []);
        if (action === 'getAll') return funnels;
        if (action === 'create') { setLocal(LOCAL_KEYS.funnels, [...funnels, data]); return { success: true }; }
        if (action === 'update') { setLocal(LOCAL_KEYS.funnels, funnels.map(f => f.id === id ? data : f)); return { success: true }; }
        if (action === 'delete') { setLocal(LOCAL_KEYS.funnels, funnels.filter(f => f.id !== id)); return { success: true }; }
        break;
    }
    case 'funnel_executions': {
        const execs = getLocal<FunnelExecution[]>(LOCAL_KEYS.funnelExecutions, []);
        if (action === 'getAll') return execs;
        if (action === 'create') { setLocal(LOCAL_KEYS.funnelExecutions, [...execs, data]); return { success: true }; }
        if (action === 'update') { setLocal(LOCAL_KEYS.funnelExecutions, execs.map(e => e.id === id ? { ...e, ...data } : e)); return { success: true }; }
        break;
    }
    case 'templates': {
        const templates = getLocal<any[]>(LOCAL_KEYS.templates, []);
        if (action === 'getAll') return templates;
        if (action === 'create') { setLocal(LOCAL_KEYS.templates, [...templates, data]); return { success: true }; }
        break;
    }
    default:
        return null;
  }
};


export const dbService = {
  checkConnection: async (): Promise<any> => {
    return Promise.resolve({ 
      connected: true, 
      database: "LocalStorage",
      version: "Browser v1.0",
      error: null,
      diagnostics: { 
        driver: 'LocalStorage',
        activeKey: 'N/A - Local Mode',
        envStatus: {'LocalStorage': 'Active & Ready'}
      } 
    });
  },

  runMigration: async (): Promise<{success: boolean, logs: string[], error?: string}> => {
    return Promise.resolve({ success: true, logs: ["Migrations not applicable in Local Storage mode."] });
  },

  getAllPosts: async (): Promise<BlogPost[]> => {
    const posts = await localApiCall('posts', 'getAll');
    return Array.isArray(posts) ? posts : [];
  },

  getPublishedPosts: async (): Promise<BlogPost[]> => {
    const posts = await dbService.getAllPosts();
    return posts.filter(p => p.status === PostStatus.PUBLISHED);
  },

  getPostBySlug: async (slug: string): Promise<BlogPost | undefined> => {
    const posts = await dbService.getAllPosts();
    return posts.find(p => p.slug === slug);
  },

  getPostById: async (id: string): Promise<BlogPost | undefined> => {
    const posts = await dbService.getAllPosts();
    return posts.find(p => p.id === id);
  },

  createPost: async (post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ post: BlogPost, synced: boolean }> => {
    const id = crypto.randomUUID();
    const newPost = { ...post, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as BlogPost;
    await localApiCall('posts', 'create', newPost);
    return { post: newPost, synced: true };
  },

  updatePost: async (id: string, updates: Partial<BlogPost>): Promise<{ success: boolean, synced: boolean }> => {
    let apiResult = await localApiCall('posts', 'update', updates, id);
    
    if (apiResult && apiResult.error === 'record_not_found') {
        const current = await dbService.getPostById(id);
        if (current) {
            const fullPost = { ...current, ...updates, updatedAt: new Date().toISOString() };
            apiResult = await localApiCall('posts', 'create', fullPost);
        }
    }

    return { success: apiResult?.success || false, synced: true };
  },

  deletePost: async (id: string): Promise<void> => {
    await localApiCall('posts', 'delete', undefined, id);
  },

  getSettings: async (): Promise<IntegrationSettings> => {
    const data = await localApiCall('cms_config', 'get');
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
    await localApiCall('cms_config', 'set', settings);
  },

  getTheme: async (): Promise<ThemeSettings> => {
    const data = await localApiCall('cms_theme', 'get');
    return { primaryColor: '#4f46e5', secondaryColor: '#1e3a8a', logoUrl: '', siteName: 'AI CMS Platform', ...data };
  },

  updateTheme: async (settings: ThemeSettings): Promise<void> => {
    await localApiCall('cms_theme', 'set', settings);
  }
};