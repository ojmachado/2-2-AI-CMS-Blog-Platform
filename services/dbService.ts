
import { BlogPost, PostStatus, IntegrationSettings, ThemeSettings } from '../types';

const API_URL = '/api/nile';

const apiCall = async (collection: string, action: string, data?: any, id?: string) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection, action, data, id })
    });
    
    const contentType = response.headers.get("content-type");
    if (!response.ok || !contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.warn("[dbService] API Offline/Error:", response.status, text.substring(0, 100));
        return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error("[dbService] Network Error:", error);
    return null;
  }
};

// --- Local Storage Helpers (Offline Mode) ---
const LOCAL_STORAGE_KEY = 'cms_posts_backup';

const getLocalPosts = (): BlogPost[] => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  } catch (e) { return []; }
};

const saveLocalPost = (post: BlogPost) => {
  if (typeof window === 'undefined') return;
  const posts = getLocalPosts();
  const index = posts.findIndex(p => p.id === post.id);
  
  if (index >= 0) {
    posts[index] = { ...posts[index], ...post };
  } else {
    posts.push(post);
  }
  
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(posts));
};

const deleteLocalPost = (id: string) => {
  if (typeof window === 'undefined') return;
  const posts = getLocalPosts().filter(p => p.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(posts));
};

export const dbService = {
  checkConnection: async (): Promise<any> => {
    const result = await apiCall('system', 'debug');
    if (result === null) {
      return { 
        connected: false, 
        error: "API Unreachable. The backend might be offline or misconfigured.", 
        diagnostics: { 
          initError: "API Unreachable",
          envStatus: {},
          discoveredVars: {}
        } 
      };
    }
    return result;
  },

  runMigration: async (): Promise<{success: boolean, logs: string[], error?: string}> => {
    const result = await apiCall('system', 'migrate');
    if (result === null) {
      return { success: false, logs: ["API connection failed"], error: "The backend might be offline or returning an invalid response." };
    }
    return result;
  },

  getAllPosts: async (): Promise<BlogPost[]> => {
    let apiPosts: BlogPost[] = [];
    try {
      const data = await apiCall('posts', 'getAll');
      if (Array.isArray(data)) apiPosts = data;
    } catch (e) {
      console.warn("Using local posts only");
    }

    const localPosts = getLocalPosts();
    
    // Merge: Prefer API, but add locals that don't exist in API (unsynced)
    const apiIds = new Set(apiPosts.map(p => p.id));
    const unsyncedLocals = localPosts.filter(p => !apiIds.has(p.id));
    
    const allPosts = [...apiPosts, ...unsyncedLocals];
    return allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getPublishedPosts: async (): Promise<BlogPost[]> => {
    const posts = await dbService.getAllPosts();
    return posts.filter(p => p.status === PostStatus.PUBLISHED);
  },

  getPostBySlug: async (slug: string): Promise<BlogPost | undefined> => {
    // Try API first
    const posts = await apiCall('posts', 'getAll');
    let post = Array.isArray(posts) ? posts.find((p: any) => p.slug === slug) : undefined;
    
    // Fallback to local
    if (!post) {
      const local = getLocalPosts();
      post = local.find(p => p.slug === slug);
    }
    
    return post;
  },

  getPostById: async (id: string): Promise<BlogPost | undefined> => {
    const posts = await dbService.getAllPosts();
    return posts.find(p => p.id === id);
  },

  createPost: async (post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ post: BlogPost, synced: boolean }> => {
    const id = Math.random().toString(36).substring(7);
    const newPost = { ...post, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as BlogPost;
    
    const apiResult = await apiCall('posts', 'create', newPost);
    
    if (!apiResult || !apiResult.success) {
      console.log("Saving locally (Offline Mode)");
      saveLocalPost(newPost);
      return { post: newPost, synced: false };
    }
    
    return { post: newPost, synced: true };
  },

  updatePost: async (id: string, updates: Partial<BlogPost>): Promise<{ success: boolean, synced: boolean }> => {
    let apiResult = await apiCall('posts', 'update', updates, id);
    
    // If update failed because record doesn't exist in DB (local-only draft), try to sync it as a new post
    if (apiResult && apiResult.error === 'record_not_found') {
        const current = await dbService.getPostById(id);
        if (current) {
            const fullPost = { ...current, ...updates, updatedAt: new Date().toISOString() };
            apiResult = await apiCall('posts', 'create', fullPost);
        }
    }

    if (!apiResult || !apiResult.success) {
      // Fetch current state to merge updates for local save
      const current = await dbService.getPostById(id);
      if (current) {
        saveLocalPost({ ...current, ...updates, updatedAt: new Date().toISOString() });
        return { success: true, synced: false };
      }
      return { success: false, synced: false };
    }
    
    // Ensure local backup is updated too in case we go offline later, or remove if strictly synced?
    // For now, keep local updated for consistency until next refresh
    const current = await dbService.getPostById(id);
    if (current) saveLocalPost({ ...current, ...updates, updatedAt: new Date().toISOString() });

    return { success: true, synced: true };
  },

  deletePost: async (id: string): Promise<void> => {
    await apiCall('posts', 'delete', undefined, id);
    deleteLocalPost(id);
  },

  getSettings: async (): Promise<IntegrationSettings> => {
    const data = await apiCall('cms_config', 'get');
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
    await apiCall('cms_config', 'set', settings);
  },

  getTheme: async (): Promise<ThemeSettings> => {
    const data = await apiCall('cms_theme', 'get');
    return { primaryColor: '#4f46e5', secondaryColor: '#1e3a8a', logoUrl: '', siteName: 'AI CMS Platform', ...data };
  },

  updateTheme: async (settings: ThemeSettings): Promise<void> => {
    await apiCall('cms_theme', 'set', settings);
  }
};