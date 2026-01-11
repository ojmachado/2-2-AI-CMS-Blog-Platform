import React, { useEffect, useState } from 'react';
import { dbService } from '../services/dbService';
import { emailService } from '../services/emailService';
import { IntegrationSettings } from '../types';
import { 
  Save, 
  BarChart, 
  Facebook, 
  MessageSquare, 
  ShieldCheck, 
  ShieldAlert, 
  Mail, 
  Loader2, 
  Send, 
  CheckCircle2, 
  Globe, 
  Layout as LayoutIcon,
  Shield
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  // FIX: Added missing properties to the initial state to match the IntegrationSettings type.
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
    dbService.getSettings().then(data => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await dbService.updateSettings(settings);
      setMessage({ text: 'Configurações salvas com sucesso.', type: 'success' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
                    ? 'Conexão validada! (Envio simulado devido ao CORS)' 
                    : 'Email de teste enviado com sucesso!', 
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

  const inputClasses = "w-full rounded-2xl border-slate-200 bg-slate-50/50 py-4 px-5 text-sm transition-all focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none shadow-sm placeholder:text-slate-300 font-medium text-slate-700";
  const labelClasses = "block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-2";

  if (loading) return (
    <div className="p-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando Conexões...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-32 px-4">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Configurações Globais</h1>
        <p className="text-slate-500 text-lg leading-relaxed">Integre suas chaves de API e automatize seu fluxo de marketing em um único lugar seguro.</p>
      </header>

      <form onSubmit={handleSave} className="space-y-8">
        {message && (
          <div className={`p-6 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100 shadow-sm' : 'bg-red-50 text-red-700 border border-red-100 shadow-sm'}`}>
            {message.type === 'success' ? <CheckCircle2 size={24} /> : <ShieldAlert size={24} />}
            <span className="font-bold text-sm">{message.text}</span>
          </div>
        )}

        {/* WhatsApp Section */}
        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-10">
            <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                <div className="p-3 bg-green-500 rounded-2xl text-white shadow-lg shadow-green-100"><MessageSquare size={24} /></div>
                <div>
                    <h2 className="text-xl font-black text-slate-900">WhatsApp Marketing</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Híbrido: Meta Cloud API + Evolution Fallback</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck size={16} className="text-indigo-500"/>
                        <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Canal Oficial (Meta)</h3>
                    </div>
                    <div>
                        <label className={labelClasses}>Access Token Meta</label>
                        <input type="password" name="metaAccessToken" value={settings.metaAccessToken} onChange={handleChange} placeholder="EAAb..." className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Phone Number ID</label>
                        <input type="text" name="metaPhoneId" value={settings.metaPhoneId} onChange={handleChange} placeholder="1234567890" className={inputClasses} />
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert size={16} className="text-amber-500"/>
                        <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest">Canal de Contingência</h3>
                    </div>
                    <div>
                        <label className={labelClasses}>URL da Instância</label>
                        <input type="text" name="evolutionApiUrl" value={settings.evolutionApiUrl} onChange={handleChange} placeholder="https://api.exemplo.com" className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>API Key Evolution</label>
                        <input type="password" name="evolutionApiKey" value={settings.evolutionApiKey} onChange={handleChange} placeholder="********" className={inputClasses} />
                    </div>
                </div>
            </div>
        </section>

        {/* Resend Section */}
        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100"><Mail size={24} /></div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Resend Email API</h2>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Envio de Newsletter e Alertas de Sistema</p>
                    </div>
                </div>
                <button 
                    type="button" 
                    onClick={handleTestEmail}
                    disabled={testingEmail}
                    className="text-[10px] font-black uppercase text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 px-5 py-3 rounded-2xl border border-indigo-100 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                    {testingEmail ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Testar Conexão
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className={labelClasses}>Resend API Key</label>
                    <input type="password" name="resendApiKey" value={settings.resendApiKey} onChange={handleChange} placeholder="re_..." className={inputClasses} />
                </div>
                <div>
                    <label className={labelClasses}>Email Remetente Verificado</label>
                    <input type="email" name="resendFromEmail" value={settings.resendFromEmail} onChange={handleChange} placeholder="contato@seudominio.com" className={inputClasses} />
                </div>
            </div>
        </section>

        {/* Tracking Section */}
        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-lg shadow-orange-100"><BarChart size={24} /></div>
                <div>
                    <h2 className="text-xl font-black text-slate-900">Google Ecosystem</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">GA4 & Google Adsense Tracking</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className={labelClasses}>Google Analytics 4 ID</label>
                    <input type="text" name="googleAnalyticsId" value={settings.googleAnalyticsId} onChange={handleChange} placeholder="G-XXXXXXXXXX" className={inputClasses} />
                </div>
                <div>
                    <label className={labelClasses}>Google AdSense Pub ID</label>
                    <input type="text" name="googleAdSenseId" value={settings.googleAdSenseId} onChange={handleChange} placeholder="pub-1234..." className={inputClasses} />
                </div>
                <div className="md:col-span-2">
                    <label className={labelClasses}>URL Base do Site (Necessário para Meta CAPI)</label>
                    <input type="text" name="siteUrl" value={settings.siteUrl} onChange={handleChange} placeholder="https://meu-portal-ai.com" className={inputClasses} />
                </div>
            </div>
        </section>

        <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white/70 backdrop-blur-2xl border-t border-slate-200 flex justify-center z-50">
            <button type="submit" disabled={saving} className="max-w-md w-full bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.15em] hover:bg-indigo-600 flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50">
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {saving ? 'Gravando...' : 'Salvar Alterações'}
            </button>
        </footer>
      </form>
    </div>
  );
};
