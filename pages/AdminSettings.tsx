
import React, { useEffect, useState } from 'react';
import { dbService } from '../services/dbService';
import { emailService } from '../services/emailService';
import { IntegrationSettings } from '../types';
import { Save, BarChart, Facebook, MessageSquare, ShieldCheck, ShieldAlert, Mail, Loader2, Send, CheckCircle2, Database, Key, UserCheck } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<IntegrationSettings>({
    googleAnalyticsId: '', googleAdSenseId: '', facebookPixelId: '', metaAccessToken: '',
    siteUrl: '', googleSearchConsoleCode: '', metaWhatsappToken: '', metaPhoneId: '',
    metaBusinessId: '', evolutionApiUrl: '', evolutionApiKey: '', evolutionInstanceName: '',
    whatsappAdminNumber: '', resendApiKey: '', resendFromEmail: '',
    postgresUrl: '', clerkPublishableKey: '', clerkSecretKey: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await dbService.getSettings();
        if (data) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error("Falha ao carregar configurações:", error);
        setMessage({ text: 'Não foi possível carregar as configurações atuais. Verifique sua conexão.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await dbService.updateSettings(settings);
      setMessage({ text: 'Configurações salvas com sucesso.', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Falha ao salvar configurações.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
      if (!settings.resendApiKey || !settings.resendFromEmail) {
          setMessage({ text: 'Configure a API Key e o Email Remetente antes de testar.', type: 'error' });
          return;
      }
      setTestingEmail(true);
      setMessage(null);
      try {
          const result = await emailService.testConnection();
          if (result.success) {
              setMessage({ 
                  text: result.simulated 
                    ? 'Conexão validada! (Envio simulado devido ao CORS no navegador)' 
                    : 'Email de teste enviado com sucesso para seu remetente!', 
                  type: 'success' 
              });
          } else {
              setMessage({ text: `Erro no teste: ${result.error}`, type: 'error' });
          }
      } catch (err) {
          setMessage({ text: 'Erro ao processar teste de e-mail.', type: 'error' });
      } finally {
          setTestingEmail(false);
      }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return (
    <div className="p-20 flex flex-col items-center justify-center gap-4 text-slate-500">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
      <span className="font-medium">Carregando configurações...</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Configurações de Integração</h1>
        <p className="text-slate-500 mt-1">Configure APIs de marketing, rastreamento e automação de e-mail.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {message && (
          <div className={`p-4 flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-b border-green-100' : 'bg-red-50 text-red-700 border-b border-red-100'}`}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        <div className="p-8 space-y-10">
            {/* Credenciais Essenciais */}
            <section className="space-y-6 p-6 bg-amber-50/60 rounded-xl border border-amber-200">
                <div className="flex items-center gap-2 border-b border-amber-200 pb-2">
                    <div className="p-2 bg-amber-500 rounded-lg text-white shadow-sm shadow-amber-100"><ShieldAlert size={18} /></div>
                    <h2 className="font-bold text-slate-900">Credenciais do Ambiente</h2>
                </div>
                <p className="text-sm text-amber-800 leading-relaxed">
                    <strong>Ação Manual Necessária:</strong> Salve suas chaves aqui para referência. Para que o sistema funcione, você <strong>DEVE</strong> copiar e colar estes valores no painel de <strong>Environment Variables</strong> do seu projeto na Vercel.
                </p>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                            <Database size={12} /> Vercel Var: <code>POSTGRES_URL</code>
                        </label>
                        <input type="password" name="postgresUrl" value={settings.postgresUrl} onChange={handleChange} placeholder="postgres://user:pass@host/db?sslmode=require" className="w-full rounded-lg border-slate-300 text-sm focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                            <UserCheck size={12} /> Vercel Var: <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>
                        </label>
                        <input type="password" name="clerkPublishableKey" value={settings.clerkPublishableKey} onChange={handleChange} placeholder="pk_test_..." className="w-full rounded-lg border-slate-300 text-sm focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                            <Key size={12} /> Vercel Var: <code>CLERK_SECRET_KEY</code>
                        </label>
                        <input type="password" name="clerkSecretKey" value={settings.clerkSecretKey} onChange={handleChange} placeholder="sk_test_..." className="w-full rounded-lg border-slate-300 text-sm focus:ring-indigo-500" />
                    </div>
                </div>
            </section>

            {/* WhatsApp Híbrido */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <div className="p-2 bg-green-600 rounded-lg text-white shadow-sm shadow-green-100"><MessageSquare size={18} /></div>
                    <h2 className="font-bold text-slate-900">WhatsApp Marketing (Híbrido)</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={14}/> Primário: Meta Official</h3>
                        <input type="password" name="metaAccessToken" value={settings.metaAccessToken} onChange={handleChange} placeholder="Access Token Meta" className="w-full rounded-lg border-slate-300 text-sm focus:ring-indigo-500" />
                        <input type="text" name="metaPhoneId" value={settings.metaPhoneId} onChange={handleChange} placeholder="Phone Number ID" className="w-full rounded-lg border-slate-300 text-sm focus:ring-indigo-500" />
                    </div>
                    <div className="space-y-4 p-4 bg-amber-50/30 rounded-xl border border-amber-100">
                        <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2"><ShieldAlert size={14}/> Fallback: Evolution API</h3>
                        <input type="text" name="evolutionApiUrl" value={settings.evolutionApiUrl} onChange={handleChange} placeholder="URL API (ex: https://api.exemplo.com)" className="w-full rounded-lg border-slate-300 text-sm focus:ring-amber-500" />
                        <input type="password" name="evolutionApiKey" value={settings.evolutionApiKey} onChange={handleChange} placeholder="API Key" className="w-full rounded-lg border-slate-300 text-sm focus:ring-amber-500" />
                    </div>
                </div>
            </section>

            {/* Google Ecosystem */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <div className="p-2 bg-orange-500 rounded-lg text-white shadow-sm shadow-orange-100"><BarChart size={18} /></div>
                    <h2 className="font-bold text-slate-900">Google Ecosystem (GA4 & Ads)</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="googleAnalyticsId" value={settings.googleAnalyticsId} onChange={handleChange} placeholder="GA4 ID (G-XXXX)" className="w-full rounded-lg border-slate-300 text-sm" />
                    <input type="text" name="googleAdSenseId" value={settings.googleAdSenseId} onChange={handleChange} placeholder="AdSense Pub ID" className="w-full rounded-lg border-slate-300 text-sm" />
                </div>
            </section>

            {/* Resend Integration */}
            <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-sm shadow-indigo-100"><Mail size={18} /></div>
                        <h2 className="font-bold text-slate-900">Resend Email API</h2>
                    </div>
                    <button 
                        type="button" 
                        onClick={handleTestEmail}
                        disabled={testingEmail}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                        {testingEmail ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                        Testar Email
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">API Key *</label>
                        <input type="password" name="resendApiKey" value={settings.resendApiKey} onChange={handleChange} placeholder="re_123456789" required className="w-full rounded-lg border-slate-300 text-sm focus:ring-indigo-500" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Remetente Verificado *</label>
                        <input type="email" name="resendFromEmail" value={settings.resendFromEmail} onChange={handleChange} placeholder="contato@seudominio.com" required className="w-full rounded-lg border-slate-300 text-sm focus:ring-indigo-500" />
                    </div>
                </div>
                <p className="text-[11px] text-slate-400 italic">Certifique-se de que o domínio do e-mail remetente está validado no painel da Resend.</p>
            </section>

            {/* Meta CAPI & Pixel */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <div className="p-2 bg-blue-600 rounded-lg text-white shadow-sm shadow-blue-100"><Facebook size={18} /></div>
                    <h2 className="font-bold text-slate-900">Meta Conversions API & Pixel</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="facebookPixelId" value={settings.facebookPixelId} onChange={handleChange} placeholder="Pixel ID" className="w-full rounded-lg border-slate-300 text-sm" />
                    <input type="password" name="metaAccessToken" value={settings.metaAccessToken} onChange={handleChange} placeholder="CAPI Access Token" className="w-full rounded-lg border-slate-300 text-sm" />
                </div>
                <input type="text" name="siteUrl" value={settings.siteUrl} onChange={handleChange} placeholder="URL do Site (ex: https://seusite.com)" className="w-full rounded-lg border-slate-300 text-sm" />
            </section>
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end">
            <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Salvar Configurações
            </button>
        </div>
      </form>
    </div>
  );
};