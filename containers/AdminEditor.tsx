
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { aiService } from '../services/aiService';
import { dbService } from '../services/dbService';
import { PostStatus, BlogPost, SeoConfig } from '../types';
import { 
  Sparkles, Loader2, ArrowLeft, Zap, CheckCircle, ImageIcon, Search, AlignLeft, 
  PenTool, RotateCw, Facebook, Layout as LayoutIcon, Globe
} from 'lucide-react';

export const AdminEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegeneratingImages, setIsRegeneratingImages] = useState(false);
  const [generatedData, setGeneratedData] = useState<Partial<BlogPost> | null>(null);

  const mdeOptions = useMemo(() => ({
    spellChecker: false,
    minHeight: "400px",
    status: false,
    autosave: { enabled: true, uniqueId: id || "new-post-v2", delay: 1000 }
  }), [id]);

  useEffect(() => {
    if (id) dbService.getPostById(id).then(post => post && setGeneratedData(post));
  }, [id]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const result = await aiService.generateFullPost(topic);
      setGeneratedData({ 
        ...result, 
        status: PostStatus.DRAFT, 
        author: 'IA Creative Agent',
        seo: result.seo || { metaTitle: '', metaDescription: '', focusKeywords: [], slug: result.slug || '' }
      });
    } catch (err) { alert("Falha na geração inteligente."); }
    finally { setIsGenerating(false); }
  };

  const handleRegenerateImages = async () => {
      if (!generatedData?.title) return;
      setIsRegeneratingImages(true);
      try {
          const [cover, thumb] = await Promise.all([
              aiService.generateSmartImage(generatedData.title, "16:9"),
              aiService.generateSmartImage(generatedData.title, "1:1")
          ]);
          setGeneratedData(prev => prev ? { ...prev, coverImage: cover, socialImage: cover, thumbnailImage: thumb } : null);
      } catch (err) { alert("Erro ao recriar conjunto de imagens."); }
      finally { setIsRegeneratingImages(false); }
  };

  const handleSave = async (status: PostStatus) => {
    if (!generatedData?.title) return;
    setIsSaving(true);
    try {
      const payload = { ...generatedData, status, updatedAt: new Date().toISOString() } as BlogPost;
      if (id) await dbService.updatePost(id, payload);
      else await dbService.createPost(payload);
      navigate('/admin');
    } catch (err) { alert("Erro ao sincronizar com banco de dados Prisma."); }
    finally { setIsSaving(false); }
  };

  if (!generatedData) return (
    <div className="max-w-4xl mx-auto py-20 text-center space-y-10 px-4 animate-in fade-in zoom-in-95">
        <div className="w-24 h-24 bg-indigo-600 text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-100 ring-8 ring-indigo-50"><Sparkles size={48} /></div>
        <div className="space-y-2">
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Gerador de Postagens</h2>
            <p className="text-slate-400 text-lg">Crie um post completo com SEO e imagens multiformato em segundos.</p>
        </div>
        <div className="relative group max-w-2xl mx-auto">
            <input 
                type="text" value={topic} onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                className="w-full p-8 pr-48 rounded-[2rem] border-2 border-slate-100 text-xl focus:border-indigo-400 outline-none transition-all shadow-xl bg-white placeholder:text-slate-200" 
                placeholder="Qual o tema do dia?" 
            />
            <button onClick={handleGenerate} disabled={isGenerating || !topic.trim()} className="absolute right-3 top-3 bottom-3 bg-indigo-600 text-white px-10 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-900 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg active:scale-95">
                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />} Gerar Post
            </button>
        </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-32 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-200 shadow-xl sticky top-24 z-40 gap-4">
        <div className="flex items-center gap-4">
            <button onClick={() => setGeneratedData(null)} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors"><ArrowLeft size={24}/></button>
            <div>
                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Painel Prisma</h3>
                <p className="font-bold text-slate-900 flex items-center gap-2">Editorial Multimodal <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span></p>
            </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleSave(PostStatus.DRAFT)} disabled={isSaving} className="px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100">Rascunho</button>
          <button onClick={() => handleSave(PostStatus.PUBLISHED)} disabled={isSaving} className="px-10 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 shadow-xl transition-all active:scale-95">
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />} Publicar Artigo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
            <div className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Título do Post</label>
                    <textarea 
                        rows={2}
                        value={generatedData.title} 
                        onChange={e => setGeneratedData({...generatedData, title: e.target.value})} 
                        className="w-full text-5xl font-black border-none focus:ring-0 p-0 text-slate-900 bg-transparent resize-none" 
                    />
                </div>
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Corpo do Conteúdo (Markdown)</label>
                    <div className="border border-slate-100 rounded-3xl overflow-hidden bg-slate-50/20">
                        <SimpleMDE value={generatedData.content} onChange={v => setGeneratedData({...generatedData, content: v})} options={mdeOptions} />
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-10">
            {/* Image Variants Box */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><ImageIcon size={20} /></div>
                    <h3 className="text-xl font-black text-slate-900">Imagens do Post</h3>
                </div>
                
                <div className="space-y-8">
                    {/* Capa Principal */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                            <span className="flex items-center gap-1.5"><LayoutIcon size={12}/> Capa (16:9)</span>
                            <span className="text-indigo-400 bg-indigo-50 px-1.5 py-0.5 rounded">BLOG</span>
                        </div>
                        <div className="aspect-video bg-slate-50 rounded-[1.5rem] overflow-hidden border border-slate-100 shadow-inner group relative">
                            {generatedData.coverImage ? (
                                <img src={generatedData.coverImage} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt="Cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon size={48}/></div>
                            )}
                        </div>
                    </div>

                    {/* Facebook/Social */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                            <span className="flex items-center gap-1.5"><Facebook size={12}/> Social (Meta)</span>
                            <span className="text-blue-400 bg-blue-50 px-1.5 py-0.5 rounded">1200x630</span>
                        </div>
                        <div className="aspect-[1.91/1] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-inner group">
                            {generatedData.socialImage ? (
                                <img src={generatedData.socialImage} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt="Social" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-200"><Facebook size={32}/></div>
                            )}
                        </div>
                    </div>

                    {/* Thumbnail */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                            <span className="flex items-center gap-1.5"><Search size={12}/> Miniatura (1:1)</span>
                            <span className="text-amber-400 bg-amber-50 px-1.5 py-0.5 rounded">FEED</span>
                        </div>
                        <div className="aspect-square w-32 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-inner group">
                            {generatedData.thumbnailImage ? (
                                <img src={generatedData.thumbnailImage} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt="Thumbnail" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon size={24}/></div>
                            )}
                        </div>
                    </div>

                    <button 
                        onClick={handleRegenerateImages} 
                        disabled={isRegeneratingImages} 
                        className="w-full py-4 bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        {isRegeneratingImages ? <Loader2 className="animate-spin" size={14}/> : <RotateCw size={14}/>} 
                        Regerar Conjunto
                    </button>
                </div>
            </div>

            {/* SEO Summary */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                <h3 className="font-black text-slate-900 flex items-center gap-2 tracking-tight"><Search size={18} className="text-indigo-600" /> Metadados SEO</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1">Caminho Permanente (Slug)</label>
                        <input 
                            type="text" 
                            value={generatedData.seo?.slug} 
                            onChange={e => setGeneratedData({...generatedData, seo: {...generatedData.seo!, slug: e.target.value}})}
                            className="w-full bg-slate-50 border-none rounded-xl text-xs font-mono p-3 text-slate-600 focus:ring-2 focus:ring-indigo-100" 
                        />
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1">Palavras-chave Ativas</label>
                        <div className="flex flex-wrap gap-1.5">
                            {generatedData.seo?.focusKeywords?.map((k, i) => (
                                <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase border border-indigo-100">#{k}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
