import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SimpleMDE from "react-simplemde-editor";
import { aiService } from '../services/aiService';
import { dbService } from '../services/dbService';
import { emailService } from '../services/emailService';
import { PostStatus, BlogPost, SeoConfig } from '../types';
import { TrendingTopic } from '../services/ai/interfaces';
import { 
  Sparkles, 
  RotateCw, 
  ImageIcon, 
  Zap, 
  CheckCircle, 
  Loader2, 
  ArrowLeft, 
  Search, 
  Link as LinkIcon,
  Hash,
  AlertTriangle,
  Info,
  Settings2,
  PenTool,
  AlignLeft,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Key,
  Clock,
  Cloud,
  Database,
  WifiOff,
  X
} from 'lucide-react';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

export const AdminEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [trends, setTrends] = useState<TrendingTopic[]>([]);
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedData, setGeneratedData] = useState<Partial<BlogPost> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quotaError, setQuotaError] = useState(false);
  const [showSeoDetails, setShowSeoDetails] = useState(true);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  
  // Status de Sincronização
  const [saveStatus, setSaveStatus] = useState<'idle' | 'synced' | 'offline'>('idle');

  const mdeOptions = useMemo(() => ({
    spellChecker: false,
    placeholder: "Comece a escrever seu conteúdo em Markdown...",
    status: false,
    autosave: { enabled: true, uniqueId: id || "new-post-content", delay: 1000 },
    renderingConfig: { singleLineBreaks: false, codeSyntaxHighlighting: true },
  }), [id]);

  useEffect(() => {
    const checkKey = async () => {
        if (window.aistudio) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setHasApiKey(hasKey);
        }
    };
    checkKey();
    if (id) dbService.getPostById(id).then(post => post && setGeneratedData(post));
  }, [id]);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setError(null);
    setQuotaError(false);
    try {
      const result = await aiService.generateFullPost(topic);
      
      const cleanedContent = result.content
        .replace(/\\n/g, '\n')
        .replace(new RegExp(`^#*\\s*${result.title}`, 'i'), '')
        .trim();

      setGeneratedData({ 
        ...result, 
        content: cleanedContent,
        status: PostStatus.DRAFT, 
        author: 'IA Agent',
        tags: result.tags || [],
        seo: result.seo || { metaTitle: '', metaDescription: '', focusKeywords: [], slug: '' }
      });
    } catch (err: any) { 
        if (err.message?.includes("Requested entity was not found.")) {
            setHasApiKey(false);
            setError("Erro de chave API. Por favor, selecione uma chave válida.");
            if (window.aistudio) window.aistudio.openSelectKey().then(() => setHasApiKey(true));
        } else if (err.message?.includes("429") || err.message?.includes("LIMITE_EXCEDIDO")) {
            setQuotaError(true);
            setError("Limite de cota atingido. Aguarde 60 segundos ou use uma chave paga.");
        } else {
            setError(err.message || "Erro na geração de conteúdo."); 
        }
    } finally { setIsGenerating(false); }
  };

  const handleSmartImageGeneration = async () => {
    if (!generatedData?.title) return;
    setIsGeneratingImage(true);
    setError(null);
    try {
      const url = await aiService.generateSmartImage(generatedData.title);
      setGeneratedData(prev => prev ? { ...prev, coverImage: url } : null);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found.")) {
          setHasApiKey(false);
          setError("Erro de chave API. Selecione uma chave válida para continuar.");
          if (window.aistudio) window.aistudio.openSelectKey().then(() => setHasApiKey(true));
      } else {
          setError(err.message || "Falha ao gerar imagem.");
      }
    } finally { setIsGeneratingImage(false); }
  };

  const handleDiscoverTrends = async () => {
      setIsDiscovering(true);
      setError(null);
      setTrends([]);
      try {
          const results = await aiService.getTrendingTopics(topic || "Technology and Innovation");
          setTrends(results);
      } catch (err: any) {
          if (err.message?.includes("Requested entity was not found.")) {
              setHasApiKey(false);
              setError("Erro de chave API ao pesquisar tendências.");
              if (window.aistudio) window.aistudio.openSelectKey().then(() => setHasApiKey(true));
          } else {
              setError(err.message || "Falha ao pesquisar tendências.");
          }
      } finally { setIsDiscovering(false); }
  };

  const handleSelectTrend = (trendTitle: string) => {
      setTopic(trendTitle);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartManual = () => {
    setGeneratedData({
      title: '', content: '', summary: '', status: PostStatus.DRAFT, author: 'Admin', tags: [],
      seo: { metaTitle: '', metaDescription: '', focusKeywords: [], slug: '' }
    });
  };

  const handleMagicSeo = async () => {
      if (!generatedData?.title || !generatedData?.content) return;
      setIsGeneratingSeo(true);
      setError(null);
      try {
          const seo = await aiService.generateSeoMetadata(generatedData.title, generatedData.content);
          setGeneratedData(prev => prev ? { ...prev, seo } : null);
          setShowSeoDetails(true);
      } catch (err: any) {
          setError(err.message || "Erro ao otimizar SEO.");
      } finally { setIsGeneratingSeo(false); }
  };

  const handleSave = async (status: PostStatus) => {
    if (!generatedData?.title) {
        alert("Por favor, adicione um título antes de salvar.");
        return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const finalSlug = generatedData.seo?.slug || generatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const payload = { ...generatedData, slug: finalSlug, status, updatedAt: new Date().toISOString() } as BlogPost;
      
      let syncResult;
      
      if (id) {
          syncResult = await dbService.updatePost(id, payload);
      } else {
          syncResult = await dbService.createPost(payload);
          if (syncResult.synced) {
             emailService.sendAdminAlert(payload.title, payload.slug, payload.status).catch(() => {});
          }
      }

      setSaveStatus(syncResult.synced ? 'synced' : 'offline');
      
      // If synced, navigate. If offline, stay to show warning.
      if (syncResult.synced) {
          setTimeout(() => navigate('/admin'), 1000);
      } else {
          setTimeout(() => navigate('/admin'), 3000); // Give user time to read "Saved locally" toast
      }

    } catch (err) { 
        console.error(err);
        setError("Falha crítica ao salvar. Tente copiar o conteúdo."); 
    } 
    finally { setIsSaving(false); }
  };

  const updateSeo = (field: keyof SeoConfig, value: any) => {
      if (!generatedData) return;
      setGeneratedData({
          ...generatedData,
          seo: { ...(generatedData.seo || { metaTitle: '', metaDescription: '', focusKeywords: [], slug: '' }), [field]: value }
      });
  };

  const onContentChange = useCallback((value: string) => {
    setGeneratedData(prev => prev ? { ...prev, content: value } : null);
  }, []);

  const getQualityColor = (length: number, idealMin: number, idealMax: number, hardMax: number) => {
      if (length === 0) return 'bg-slate-100 text-slate-400 border-slate-200';
      if (length > hardMax) return 'bg-red-50 text-red-600 border-red-200 animate-pulse'; 
      if (length >= idealMin && length <= idealMax) return 'bg-green-50 text-green-600 border-green-200';
      return 'bg-amber-50 text-amber-600 border-amber-200';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 relative">
      {saveStatus === 'offline' && (
        <div className="fixed bottom-8 right-8 max-w-md bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-2xl z-50 flex gap-3 animate-in slide-in-from-right duration-500">
            <WifiOff className="text-amber-600 shrink-0" size={24} />
            <div>
                <h4 className="font-bold text-amber-900">Salvo apenas localmente!</h4>
                <p className="text-sm text-amber-700 mt-1">O banco de dados parece estar offline. Seus dados estão seguros no navegador.</p>
            </div>
            <button onClick={() => setSaveStatus('idle')} className="ml-auto text-amber-400 hover:text-amber-600 self-start">
                <X size={16} />
            </button>
        </div>
      )}

      {quotaError && (
        <div className="bg-indigo-950 text-white p-6 rounded-[2rem] shadow-2xl border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-6 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-5">
                <div className="p-4 bg-indigo-500/20 rounded-2xl">
                    <Clock size={32} className="text-indigo-400 animate-pulse" />
                </div>
                <div>
                    <h3 className="text-xl font-black tracking-tight">Limite de Requisições Atingido</h3>
                    <p className="text-indigo-200 text-sm max-w-md">O modo Flash está sendo utilizado para manter a operação. Recomendamos o uso de uma chave API com faturamento para posts ilimitados.</p>
                </div>
            </div>
            <button onClick={handleSelectKey} className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-2"><Key size={16} /> Ativar Chave Paga</button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm sticky top-24 z-40">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin')} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="text-2xl font-black text-slate-900">{id ? 'Refinar Artigo' : 'Nova Criação'}</h1>
                <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Workspace Editorial</p>
                    {saveStatus === 'synced' && <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100"><Cloud size={10} /> Salvo na Nuvem</span>}
                    {saveStatus === 'offline' && <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100"><WifiOff size={10} /> Modo Offline</span>}
                </div>
            </div>
        </div>
        <div className="flex gap-3">
            <button onClick={() => handleSave(PostStatus.DRAFT)} disabled={isSaving || !generatedData} className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 disabled:opacity-50 hover:bg-slate-50 transition-all">
                Salvar Rascunho
            </button>
            <button onClick={() => handleSave(PostStatus.PUBLISHED)} disabled={isSaving || !generatedData} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 disabled:opacity-50 transition-all">
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : (saveStatus === 'synced' ? <CheckCircle size={18} /> : <Database size={18} />)} 
                {isSaving ? 'Salvando...' : 'Publicar Agora'}
            </button>
        </div>
      </div>

      {error && !quotaError && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl flex items-center gap-3">
              <AlertTriangle size={20} className="shrink-0" />
              <span className="text-sm font-semibold">{error}</span>
          </div>
      )}

      {!generatedData && (
          <div className="space-y-12">
            <div className="bg-white p-12 md:p-20 rounded-[3rem] shadow-xl border border-indigo-100 text-center space-y-8 max-w-4xl mx-auto">
                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto text-indigo-600 mb-2 shadow-inner">
                    <Sparkles size={40} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">O que vamos publicar hoje?</h2>
                    <p className="text-slate-500 text-lg">Gere conteúdo épico em segundos com Inteligência Artificial.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                    <div className="flex-1 relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search size={20} className="text-slate-300" />
                        </div>
                        <input 
                            type="text" 
                            value={topic} 
                            onChange={e => setTopic(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                            placeholder="Tópico ou Nicho..." 
                            className="w-full p-5 pl-12 border border-slate-200 rounded-2xl text-lg focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all shadow-sm" 
                        />
                    </div>
                    <button 
                        onClick={handleGenerate} 
                        disabled={isGenerating || !topic.trim()} 
                        className="bg-indigo-600 text-white px-8 rounded-2xl font-black text-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2 group"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} />}
                        Gerar Artigo
                    </button>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <button onClick={handleDiscoverTrends} disabled={isDiscovering} className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest bg-indigo-50 px-5 py-2.5 rounded-xl border border-indigo-100 transition-all hover:bg-indigo-100 active:scale-95 disabled:opacity-50">
                        {isDiscovering ? <Loader2 className="animate-spin" size={14} /> : <TrendingUp size={14} />}
                        Pesquisar Tendências
                    </button>
                    <button onClick={handleStartManual} className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-100 transition-all hover:bg-slate-100">
                        <PenTool size={14} /> Escrita Manual
                    </button>
                </div>
            </div>

            {trends.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><TrendingUp size={20} /></div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Tendências Encontradas (Google Search)</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trends.map((trend, idx) => (
                            <div key={idx} className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:border-indigo-400 transition-all group relative overflow-hidden flex flex-col hover:shadow-xl">
                                <div className="flex-1 space-y-4 mb-6">
                                    <div className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">{trend.relevance} Relevance</div>
                                    <h4 className="text-lg font-black text-slate-900 leading-tight">{trend.title}</h4>
                                    
                                    {trend.sources && trend.sources.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                <ExternalLink size={10} /> Fontes de Grounding:
                                            </p>
                                            <ul className="space-y-1">
                                                {trend.sources.map((source, sIdx) => (
                                                    <li key={sIdx}>
                                                        <a 
                                                            href={source.uri} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="text-[10px] text-indigo-600 hover:underline truncate block"
                                                            title={source.title}
                                                        >
                                                            {source.title || source.uri}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => handleSelectTrend(trend.title)} className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95">Usar este Tópico <ChevronRight size={14} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
      )}

      {generatedData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-indigo-500 tracking-widest flex items-center gap-2"><Info size={12} /> Título do Conteúdo</label>
                        <input type="text" value={generatedData.title} onChange={e => setGeneratedData({...generatedData, title: e.target.value})} placeholder="Um título chamativo..." className="w-full text-4xl font-black border-none focus:ring-0 text-slate-900 p-0" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mb-2 flex items-center gap-2"><Info size={12} /> Editor Markdown</label>
                        <SimpleMDE value={generatedData.content} onChange={onContentChange} options={mdeOptions} />
                      </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                      <div className="bg-slate-50/50 p-8 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100"><Search size={24} /></div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Módulo SEO</h3>
                                <p className="text-sm text-slate-500">Otimização orgânica ultra veloz.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={handleMagicSeo} disabled={isGeneratingSeo} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 disabled:opacity-50">
                                {isGeneratingSeo ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />} Otimizar
                            </button>
                        </div>
                      </div>

                      {showSeoDetails && (
                        <div className="p-8 space-y-10 animate-in slide-in-from-top-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Settings2 size={12} /> SEO Meta Title</label>
                                            <div className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${getQualityColor(generatedData.seo?.metaTitle?.length || 0, 40, 60, 65)}`}>
                                                {generatedData.seo?.metaTitle?.length || 0}/60
                                            </div>
                                        </div>
                                        <input type="text" value={generatedData.seo?.metaTitle || ''} onChange={e => updateSeo('metaTitle', e.target.value)} className="w-full rounded-2xl border-slate-200 text-sm py-4 px-4 shadow-sm focus:ring-4 focus:ring-indigo-50 outline-none" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><LinkIcon size={12} /> Slug</label>
                                        <input type="text" value={generatedData.seo?.slug || ''} onChange={e => updateSeo('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} className="w-full rounded-2xl border-slate-200 text-sm py-4 px-4 shadow-sm font-mono focus:ring-4 focus:ring-indigo-50 outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><AlignLeft size={12} /> Meta Description</label>
                                            <div className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${getQualityColor(generatedData.seo?.metaDescription?.length || 0, 100, 155, 160)}`}>
                                                {generatedData.seo?.metaDescription?.length || 0}/155
                                            </div>
                                        </div>
                                        <textarea rows={3} value={generatedData.seo?.metaDescription || ''} onChange={e => updateSeo('metaDescription', e.target.value)} className="w-full rounded-2xl border-slate-200 text-sm py-4 px-4 shadow-sm resize-none focus:ring-4 focus:ring-indigo-50 outline-none" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Hash size={12} /> Palavras-chave</label>
                                        <input type="text" value={generatedData.seo?.focusKeywords?.join(', ') || ''} onChange={e => updateSeo('focusKeywords', e.target.value.split(',').map(s => s.trim()))} className="w-full rounded-2xl border-slate-200 text-sm py-4 px-4 shadow-sm focus:ring-4 focus:ring-indigo-50 outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                      )}
                  </div>
              </div>

              <div className="space-y-8">
                  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2"><ImageIcon size={18} className="text-indigo-600" /> Capa Destacada</h3>
                      <div className="aspect-[16/10] bg-slate-50 rounded-[1.5rem] overflow-hidden border border-slate-100 relative group shadow-inner">
                          {isGeneratingImage && (
                              <div className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4 text-center">
                                  <Loader2 className="animate-spin mb-2" size={32} />
                                  <span className="text-[10px] font-black uppercase tracking-widest">IA gerando sua capa...</span>
                              </div>
                          )}
                          {generatedData.coverImage ? (
                              <img src={generatedData.coverImage} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt="Capa" />
                          ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 space-y-2">
                                  <ImageIcon size={40} strokeWidth={1} />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Sem Capa</span>
                              </div>
                          )}
                          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
                              <button onClick={handleSmartImageGeneration} disabled={isGeneratingImage || !generatedData.title} className="bg-white text-indigo-900 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-indigo-50 shadow-xl disabled:opacity-50">
                                  {isGeneratingImage ? <Loader2 className="animate-spin" size={14} /> : <RotateCw size={14} />} 
                                  {isGeneratingImage ? 'Gerando...' : 'Recriar Imagem'}
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};