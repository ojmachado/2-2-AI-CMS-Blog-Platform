import { GoogleGenAI } from "@google/genai";
import { TextGeneratorProvider, ImageGeneratorProvider, VideoGeneratorProvider, TrendingTopic } from "./interfaces";
import { AIResponse, SeoConfig, LandingPage } from "../../types";

const safeFetch = async (url: string, body: any) => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(body),
      redirect: 'manual' // Importante: Impede seguir redirects para página de login automaticamente
    });

    // Detectar Opaque Redirect (Network Layer) ou 3xx
    if (res.type === 'opaqueredirect' || res.status === 0 || (res.status >= 300 && res.status < 400)) {
        throw new Error("Sessão expirada. Por favor, recarregue a página.");
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details || "Request failed");
      return data;
    } else {
      const text = await res.text();
      console.error(`[AI Provider] Invalid Response (${res.status}):`, text.substring(0, 500));
      
      if (res.status === 200) {
          if (text.trim().startsWith('<')) {
             const titleMatch = text.match(/<title>(.*?)<\/title>/i);
             const pageTitle = titleMatch ? titleMatch[1] : 'Página desconhecida';
             
             if (text.includes('clerk') || pageTitle.toLowerCase().includes('sign in')) {
                 throw new Error("Sessão expirada. Recarregue a página.");
             }
             
             if (pageTitle.includes('Error')) {
                 throw new Error(`Erro do Servidor (HTML): ${pageTitle}.`);
             }

             throw new Error(`Erro de Roteamento: Recebido HTML (${pageTitle}) em vez de JSON.`);
          }
          throw new Error(`Resposta inválida da API. Conteúdo não é JSON.`);
      }
      throw new Error(`Erro HTTP ${res.status}: ${res.statusText}`);
    }
  } catch (error: any) {
    console.error("[AI Provider] Error:", error);
    throw error;
  }
};

export class GeminiTextProvider implements TextGeneratorProvider {
  async generatePost(topic: string): Promise<AIResponse> {
    return safeFetch('/api/ai', { task: 'generate_post', payload: { topic } });
  }

  async generateVisualPrompt(title: string): Promise<string> {
    const res = await safeFetch('/api/ai', { task: 'generate_visual_prompt', payload: { title } });
    return res.prompt;
  }

  async generateSeo(title: string, content: string): Promise<SeoConfig> {
    return safeFetch('/api/ai', { task: 'generate_seo', payload: { title, content } });
  }

  async generateLanding(data: LandingPage): Promise<string> {
    const res = await safeFetch('/api/ai', { task: 'generate_landing', payload: { data } });
    return res.html;
  }

  async getTrendingTopics(niche: string): Promise<TrendingTopic[]> {
    return safeFetch('/api/ai', { task: 'get_trends', payload: { niche } });
  }
}

export class GeminiImageProvider implements ImageGeneratorProvider {
  async generateImage(prompt: string, aspectRatio: string = "16:9"): Promise<string> {
    const data = await safeFetch('/api/ai', { task: 'generate_image', payload: { prompt, aspectRatio } });
    return data.url;
  }
}

export class VeoVideoProvider implements VideoGeneratorProvider {
  async generateVideo(prompt: string): Promise<string> {
    throw new Error("Video generation requires specific client-side configuration.");
  }
}