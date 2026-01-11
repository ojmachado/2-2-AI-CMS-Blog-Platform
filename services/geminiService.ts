
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, SeoConfig } from '../types';

export const geminiService = {
  /**
   * Generates a blog post based on a topic string, including SEO metadata.
   * Using gemini-3-flash-preview for better quota limits and speed.
   */
  generateBlogPost: async (topic: string): Promise<AIResponse> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a comprehensive, engaging blog post about: "${topic}". 
        The audience is tech-savvy but appreciates clear, accessible language.
        Format the content as clean HTML (using <h2>, <p>, <ul>, <li> tags), but do NOT include the <html> or <body> tags.
        Also act as an SEO Specialist and generate optimized metadata.`,
        config: {
          systemInstruction: "You are an expert technical blog writer and SEO specialist.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              summary: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              seo: {
                type: Type.OBJECT,
                properties: {
                    metaTitle: { type: Type.STRING },
                    metaDescription: { type: Type.STRING },
                    focusKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                    slug: { type: Type.STRING }
                },
                required: ["metaTitle", "metaDescription", "focusKeywords", "slug"]
              },
              slug: { type: Type.STRING } 
            },
            required: ["title", "content", "summary", "slug", "tags", "seo"]
          }
        }
      });

      if (!response.text) {
        throw new Error("No response generated from Gemini.");
      }

      return JSON.parse(response.text) as AIResponse;
    } catch (error: any) {
      if (error.message?.includes("429")) {
        throw new Error("LIMITE_EXCEDIDO: Você atingiu o limite de requisições. Aguarde 60 segundos ou use uma chave API paga.");
      }
      throw error;
    }
  },

  generateSeoMetadata: async (title: string, content: string): Promise<SeoConfig> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze: Title: ${title}, Content: ${content.substring(0, 800)}... Generate SEO metadata.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        metaTitle: { type: Type.STRING },
                        metaDescription: { type: Type.STRING },
                        focusKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        slug: { type: Type.STRING }
                    },
                    required: ["metaTitle", "metaDescription", "focusKeywords", "slug"]
                }
            }
        });

        if (!response.text) throw new Error("No SEO data generated");
        return JSON.parse(response.text) as SeoConfig;
    } catch (error: any) {
        if (error.message?.includes("429")) {
          throw new Error("LIMITE_EXCEDIDO: Cota temporariamente esgotada.");
        }
        throw error;
    }
  },

  generateIdeas: async (niche: string): Promise<string[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
     try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate 5 blog post title ideas for: "${niche}".`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
      });
      return response.text ? JSON.parse(response.text) : [];
     } catch (error) {
         return [];
     }
  }
};
