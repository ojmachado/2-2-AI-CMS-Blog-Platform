import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // A autenticação do Clerk foi removida.
    // Em um ambiente de produção real, uma nova verificação de sessão (ex: JWT) seria necessária aqui.

    const apiKey = process.env.API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Chave Gemini (API_KEY) não configurada.' }, { status: 500 });

    const body = await req.json();
    const { task, payload } = body;
    const ai = new GoogleGenAI({ apiKey });

    // Robust JSON Extractor
    const extractJson = (text: string) => {
        let jsonString = text.trim();
        jsonString = jsonString.replace(/^```json\s*/i, '').replace(/```$/, '');
        
        const firstOpen = jsonString.indexOf('{');
        const lastClose = jsonString.lastIndexOf('}');
        
        if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
            jsonString = jsonString.substring(firstOpen, lastClose + 1);
        } else {
             const firstOpenArr = jsonString.indexOf('[');
             const lastCloseArr = jsonString.lastIndexOf(']');
             if (firstOpenArr !== -1 && lastCloseArr !== -1 && lastCloseArr > firstOpenArr) {
                 jsonString = jsonString.substring(firstOpenArr, lastCloseArr + 1);
             }
        }
        
        return JSON.parse(jsonString);
    };

    const handleJsonContent = async (response: any) => {
        const txt = response.text;
        if (!txt) {
            console.error("Gemini returned empty text.");
            throw new Error("A IA não gerou conteúdo de texto.");
        }
        try {
            const json = extractJson(txt);
            return NextResponse.json(json);
        } catch (e: any) {
            console.error("Failed to parse AI JSON:", txt);
            return NextResponse.json({ 
                error: "Falha ao processar JSON da IA", 
                details: e.message,
                raw_content: txt 
            }, { status: 500 });
        }
    };

    switch (task) {
      case 'generate_post': {
        const { topic } = payload;
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Atue como um especialista em conteúdo. Escreva um post de blog completo e detalhado sobre: "${topic}".
          
          REGRAS OBRIGATÓRIAS:
          1. Retorne APENAS um JSON válido.
          2. O campo 'content' deve ser HTML limpo (h2, p, ul, li, blockquote). Não use tags <html> ou <body>.
          3. O campo 'imagePrompt' deve descrever uma cena fotográfica realista para capa.
          
          Estrutura JSON esperada:
          {
            "title": "Título atraente",
            "content": "Conteúdo HTML...",
            "summary": "Resumo curto...",
            "slug": "url-amigavel",
            "tags": ["tag1", "tag2"],
            "imagePrompt": "Prompt visual...",
            "seo": {
                "metaTitle": "SEO Title",
                "metaDescription": "SEO Desc",
                "focusKeywords": ["kw1", "kw2"],
                "slug": "url-amigavel"
            }
          }`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                summary: { type: Type.STRING },
                slug: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                imagePrompt: { type: Type.STRING },
                seo: {
                  type: Type.OBJECT,
                  properties: {
                    metaTitle: { type: Type.STRING },
                    metaDescription: { type: Type.STRING },
                    focusKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                    slug: { type: Type.STRING }
                  },
                  required: ["metaTitle", "metaDescription", "focusKeywords", "slug"]
                }
              },
              required: ["title", "content", "summary", "slug", "tags", "seo", "imagePrompt"]
            }
          }
        });
        
        return handleJsonContent(response);
      }

      case 'generate_seo': {
        const { title, content } = payload;
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Analise este conteúdo e gere metadados SEO. Título: ${title}, Preview: ${content.substring(0, 1500)}...`,
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
        return handleJsonContent(response);
      }

      case 'generate_visual_prompt': {
        const { title } = payload;
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Describe a cinematic, high-quality photography scene to serve as a cover image for a blog post titled: "${title}". English. Concise. Max 40 words.`,
        });
        return NextResponse.json({ prompt: response.text || `A futuristic representation of ${title}` });
      }

      case 'generate_image': {
        const { prompt, aspectRatio } = payload;
        try {
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: {
                parts: [{ text: prompt }]
              },
              config: {
                imageConfig: {
                  aspectRatio: aspectRatio === '1:1' ? '1:1' : '16:9',
                }
              }
            });

            let imageUrl = null;
            if (response.candidates && response.candidates[0].content.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                        break;
                    }
                }
            }

            if (!imageUrl) throw new Error("Imagem não gerada.");
            return NextResponse.json({ url: imageUrl });
        } catch (e: any) {
            console.error("Image Gen Error:", e);
            return NextResponse.json({ error: "Falha na geração de imagem", details: e.message }, { status: 500 });
        }
      }

      case 'get_trends': {
        const { niche } = payload;
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Find 5 trending topics related to "${niche}" right now. Return JSON.`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            relevance: { type: Type.STRING },
                            sources: { 
                                type: Type.ARRAY, 
                                items: { 
                                    type: Type.OBJECT,
                                    properties: { title: { type: Type.STRING }, uri: { type: Type.STRING } }
                                } 
                            }
                        }
                    }
                }
            }
        });
        return handleJsonContent(response);
      }

      case 'generate_landing': {
        const { data } = payload;
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: `Crie uma Landing Page HTML persuasiva baseada nestes dados: ${JSON.stringify(data)}. 
          Retorne APENAS um JSON com o campo "html" contendo o código completo com Tailwind CSS (CDN).`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: { html: { type: Type.STRING } },
              required: ["html"]
            }
          }
        });
        return handleJsonContent(response);
      }

      default:
        return NextResponse.json({ error: 'Tarefa desconhecida' }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[API AI Error]", error);
    return NextResponse.json({ 
      error: 'Erro interno no processamento da IA', 
      details: error.message 
    }, { status: 500 });
  }
}