
import { AIResponse, SeoConfig, LandingPage } from '../../types';

export interface TrendingTopic {
  title: string;
  relevance: string;
  sources: { title: string; uri: string }[];
}

export interface TextGeneratorProvider {
  generatePost(topic: string): Promise<AIResponse>;
  generateSeo(title: string, content: string): Promise<SeoConfig>;
  generateVisualPrompt(title: string): Promise<string>;
  generateLanding(data: LandingPage): Promise<string>;
  getTrendingTopics(niche: string): Promise<TrendingTopic[]>;
}

export interface ImageGeneratorProvider {
  generateImage(prompt: string, aspectRatio?: string): Promise<string>;
}

export interface VideoGeneratorProvider {
  generateVideo(prompt: string): Promise<string>;
}
