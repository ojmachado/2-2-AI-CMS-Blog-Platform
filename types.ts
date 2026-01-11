
import React from 'react';

export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED'
}

export interface SeoConfig {
  metaTitle: string;
  metaDescription: string;
  focusKeywords: string[];
  slug: string; 
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string; 
  author: string;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  coverImage?: string;
  socialImage?: string;
  thumbnailImage?: string;
  videoUrl?: string; 
  tags: string[];
  seo: SeoConfig;
}

export interface LandingPage {
  subject: string;
  ctaText: string;
  generalLink: string;
  salesContext: string;
  salesLink: string;
  partnerLink: string;
  generatedHtml?: string;
}

export interface AIResponse {
  title: string;
  content: string;
  summary: string;
  slug: string;
  tags: string[];
  seo: SeoConfig;
  imagePrompt: string; 
  videoUrl?: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

export interface IntegrationSettings {
  googleAnalyticsId: string;
  googleAdSenseId: string;
  facebookPixelId: string;
  metaAccessToken: string; 
  siteUrl: string; 
  googleSearchConsoleCode: string;
  metaWhatsappToken: string; 
  metaPhoneId: string; 
  metaBusinessId: string; 
  evolutionApiUrl: string;
  evolutionApiKey: string;
  evolutionInstanceName: string;
  whatsappAdminNumber: string; 
  resendApiKey: string;
  resendFromEmail: string;
  postgresUrl: string;
  clerkPublishableKey: string;
  clerkSecretKey: string;
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  siteName: string;
}

export interface User {
  email: string;
  role: 'admin' | 'editor';
  createdAt?: string;
  lastSignInTime?: string;
}

export enum AuthStep {
  EMAIL = 'EMAIL',
  PASSWORD = 'PASSWORD',
  CREATE_PASSWORD = 'CREATE_PASSWORD',
  BLOCKED = 'BLOCKED'
}

export type PipelineStage = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

export interface Lead {
  id: string; 
  email: string;
  name?: string; 
  phone?: string; 
  notes?: string; 
  externalId: string; 
  source: string; 
  status: 'active' | 'unsubscribed';
  pipelineStage: PipelineStage; 
  tags: string[]; 
  createdAt: string;
  userAgent?: string;
}

export interface WhatsAppTemplate {
  name: string;
  label: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  variables: string[]; 
  previewText: string;
}

export interface WhatsAppMessageTemplate {
  id: string;
  title: string; 
  content: string; 
  type: 'text' | 'meta_template';
  variables?: string[];
}

export type FunnelNodeType = 'EMAIL' | 'DELAY' | 'CONDITION' | 'TAG_ACTION' | 'WHATSAPP';

export interface FunnelNode {
  id: string;
  type: FunnelNodeType;
  position: { x: number; y: number }; 
  data: {
    subject?: string;
    content?: string;
    hours?: number;
    sendTime?: string; 
    action?: 'add' | 'remove';
    tag?: string;
    conditionTarget?: 'tags'; 
    conditionOperator?: 'contains' | 'not_contains';
    conditionValue?: string; 
    waTemplateId?: string;
    waTemplateTitle?: string;
    customTitle?: string; 
  };
  nextNodeId?: string | null; 
  trueNodeId?: string | null;
  falseNodeId?: string | null;
}

export interface Funnel {
  id: string;
  name: string;
  trigger: string; 
  isActive: boolean;
  nodes: FunnelNode[];
  startNodeId: string;
}

export interface FunnelExecution {
  id: string;
  funnelId: string;
  leadId: string;
  currentNodeId: string | null;
  status: 'waiting' | 'completed';
  nextRunAt: string; 
  history: string[]; 
  context?: Record<string, string>;
}