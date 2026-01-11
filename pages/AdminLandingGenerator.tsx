
import React, { useState } from 'react';
import { aiService } from '../services/aiService';
import { LandingPage } from '../types';
import { Sparkles, Layout, Link as LinkIcon, ShoppingCart, Users, Eye, Copy, CheckCircle, Loader2, Smartphone, Monitor } from 'lucide-react';

export const AdminLandingGenerator: React.FC = () => {
  const [data, setData] = useState<LandingPage>({
    subject: '',
    ctaText: 'Quero aproveitar agora',
    generalLink: '',
    salesContext: '',
    salesLink: '',
    partnerLink: '',
    generatedHtml: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const handleGenerate = async () => {
    if (!data.subject.trim()) return;
    setIsGenerating(true);
    try {
      const html = await aiService.generateLandingPage(data);
      setData(prev => ({ ...prev, generatedHtml: html }));
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao gerar landing page: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (data.generatedHtml) {
      navigator.clipboard.writeText(data.generatedHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Layout className="text-indigo-600" /> Gerador de Landing Pages
          </h1>
          <p className="text-slate-500 mt-1">Crie páginas de alta conversão injetando seus links automaticamente.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start h-full">
        {/* Input Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6 lg:sticky lg:top-24">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Sparkles size={14} className="text-indigo-600" /> Assunto da Página
              </label>
              <textarea
                name="subject"
                value={data.subject}
                onChange={handleChange}
                placeholder="Ex: Treinamento avançado de Marketing Digital com IA para negócios locais."
                rows={3}
                className="w-full rounded-xl border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 border p-3 text-sm transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Layout size={14} className="text-indigo-600" /> Texto da CTA
                </label>
                <input
                  type="text"
                  name="ctaText"
                  value={data.ctaText}
                  onChange={handleChange}
                  className="w-full rounded-xl border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 border p-3 text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <LinkIcon size={14} className="text-indigo-600" /> Link Geral (Site)
                </label>
                <input
                  type="text"
                  name="generalLink"
                  value={data.generalLink}
                  onChange={handleChange}
                  placeholder="https://meusite.com"
                  className="w-full rounded-xl border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 border p-3 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <ShoppingCart size={14} className="text-indigo-600" /> Contexto de Vendas
              </label>
              <textarea
                name="salesContext"
                value={data.salesContext}
                onChange={handleChange}
                placeholder="O que você está vendendo? Detalhes do produto/serviço, dores que resolve, benefícios..."
                rows={3}
                className="w-full rounded-xl border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 border p-3 text-sm transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <ShoppingCart size={14} className="text-green-600" /> Link de Vendas
                </label>
                <input
                  type="text"
                  name="salesLink"
                  value={data.salesLink}
                  onChange={handleChange}
                  placeholder="https://pay..."
                  className="w-full rounded-xl border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 border p-3 text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Users size={14} className="text-amber-600" /> Link de Parceiro
                </label>
                <input
                  type="text"
                  name="partnerLink"
                  value={data.partnerLink}
                  onChange={handleChange}
                  placeholder="https://ref..."
                  className="w-full rounded-xl border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 border p-3 text-sm transition-all"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !data.subject.trim()}
            className="w-full py-4 rounded-xl text-white font-bold bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {isGenerating ? 'Criando sua página...' : 'Gerar Estrutura Persuasiva'}
          </button>
        </div>

        {/* Preview / Result */}
        <div className="space-y-4 lg:h-[calc(100vh-10rem)] lg:sticky lg:top-24 flex flex-col">
          <div className="flex justify-between items-center bg-white border border-slate-200 p-2 rounded-xl shadow-sm">
             <div className="flex items-center gap-2">
                <button 
                    onClick={() => setPreviewMode('desktop')} 
                    className={`p-2 rounded-lg transition-colors ${previewMode === 'desktop' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Desktop View"
                >
                    <Monitor size={18} />
                </button>
                <button 
                    onClick={() => setPreviewMode('mobile')} 
                    className={`p-2 rounded-lg transition-colors ${previewMode === 'mobile' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Mobile View"
                >
                    <Smartphone size={18} />
                </button>
                <div className="h-4 w-px bg-slate-200 mx-1"></div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Preview</span>
             </div>
             {data.generatedHtml && (
                <button onClick={handleCopy} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all text-slate-700">
                    {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                    {copied ? 'Copiado!' : 'Copiar HTML'}
                </button>
             )}
          </div>

          <div className="flex-1 bg-slate-100/50 rounded-2xl border border-slate-200 relative overflow-hidden flex justify-center">
            {!data.generatedHtml && !isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-10 text-center">
                    <Layout size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-medium max-w-xs">Preencha os campos para gerar sua Landing Page de alta conversão.</p>
                </div>
            )}
            
            {isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-20">
                    <div className="p-4 bg-white rounded-full shadow-xl mb-4">
                        <Loader2 className="animate-spin text-indigo-600" size={32} />
                    </div>
                    <p className="text-indigo-900 font-bold animate-pulse">Acelerando a Inteligência...</p>
                </div>
            )}

            {data.generatedHtml && (
                <div className={`transition-all duration-500 ease-in-out bg-white h-full shadow-2xl overflow-y-auto ${previewMode === 'mobile' ? 'w-[375px] my-4 rounded-[2rem] border-8 border-slate-800' : 'w-full'}`}>
                    {/* Rendered Content */}
                    <div 
                        className="landing-preview-container"
                        dangerouslySetInnerHTML={{ __html: data.generatedHtml }} 
                    />
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
