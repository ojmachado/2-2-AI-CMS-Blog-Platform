
import { GeminiTextProvider, GeminiImageProvider, VeoVideoProvider } from './ai/GeminiProvider';
import { AIResponse, SeoConfig, LandingPage } from '../types';

class AIService {
  private textProvider = new GeminiTextProvider();
  private imageProvider = new GeminiImageProvider();

  async generateFullPost(topic: string): Promise<AIResponse & { coverImage?: string, socialImage?: string, thumbnailImage?: string }> {
    // 1. Gera o texto e o prompt da imagem
    const textResponse = await this.textProvider.generatePost(topic);
    
    let coverImage, socialImage, thumbnailImage;

    if (textResponse.imagePrompt) {
      try {
        console.log("[AIService] Iniciando geração multimodal de imagens...");
        
        // Gera as duas variantes principais em paralelo
        // 16:9 é usado para Capa do Post e Open Graph (Facebook/LinkedIn)
        // 1:1 é usado para Miniaturas em listas e feeds
        const [cover, thumb] = await Promise.all([
          this.imageProvider.generateImage(textResponse.imagePrompt, "16:9"),
          this.imageProvider.generateImage(textResponse.imagePrompt, "1:1")
        ]);

        coverImage = cover;
        socialImage = cover; // Para redes sociais, 16:9 é o padrão atual dominante
        thumbnailImage = thumb;
        
        console.log("[AIService] Variantes de imagem geradas com sucesso.");
      } catch (e) {
        console.warn("[AIService] Geração de imagens falhou, mas o post foi mantido.", e);
      }
    }

    return { ...textResponse, coverImage, socialImage, thumbnailImage };
  }

  async generateSmartImage(title: string, aspectRatio: string = "16:9"): Promise<string> {
    const visualPrompt = await this.textProvider.generateVisualPrompt(title);
    return await this.imageProvider.generateImage(visualPrompt, aspectRatio);
  }

  async generateSeoMetadata(title: string, content: string): Promise<SeoConfig> {
    return await this.textProvider.generateSeo(title, content);
  }

  async generateLandingPage(data: LandingPage): Promise<string> {
    return await this.textProvider.generateLanding(data);
  }

  async getTrendingTopics(niche: string) {
    return await this.textProvider.getTrendingTopics(niche);
  }
}

export const aiService = new AIService();
