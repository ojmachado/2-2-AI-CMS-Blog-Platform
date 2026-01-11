
import React, { useState } from 'react';
import { leadService } from '../services/leadService';
import { Mail, ArrowRight, CheckCircle, Loader2, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export const NewsletterForm: React.FC<{ variant?: 'sidebar' | 'footer' }> = ({ variant = 'footer' }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const { theme } = useTheme();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !phone || !name) return;

    setStatus('loading');
    try {
      await leadService.subscribe(email, `newsletter_${variant}`, name, phone);
      setStatus('success');
      setMessage(t('successMessage'));
      setName('');
      setEmail('');
      setPhone('');
    } catch (err) {
      setStatus('error');
      setMessage('Something went wrong. Try again.');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, '');
      setPhone(val);
  };

  if (status === 'success') {
    return (
      <div className={`rounded-lg p-6 text-center ${variant === 'footer' ? 'bg-white/10' : 'bg-green-50'}`}>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-3">
          <CheckCircle size={24} />
        </div>
        <h3 className={`font-bold ${variant === 'footer' ? 'text-white' : 'text-slate-900'}`}>{t('successTitle')}</h3>
        <p className={`text-sm mt-1 ${variant === 'footer' ? 'text-white/80' : 'text-slate-600'}`}>
          {t('successMessage')} {phone && (t('language') === 'pt-BR' ? 'Confira seu WhatsApp!' : 'Check your WhatsApp!')}
        </p>
        <button 
            onClick={() => setStatus('idle')}
            className="mt-4 text-xs underline opacity-70 hover:opacity-100"
        >
            {t('language') === 'pt-BR' ? 'Adicionar outro e-mail' : 'Add another email'}
        </button>
      </div>
    );
  }

  const inputBgClass = variant === 'footer' 
    ? 'bg-black/20 border-transparent text-white placeholder:text-white/40 focus:bg-black/40' 
    : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-indigo-500';

  return (
    <div className={`rounded-2xl p-6 ${variant === 'footer' ? 'bg-white/5 border border-white/10' : 'bg-white shadow-sm border border-slate-200'}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${variant === 'footer' ? 'bg-white/10 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
            <Mail size={20} />
        </div>
        <div>
            <h3 className={`font-bold ${variant === 'footer' ? 'text-white' : 'text-slate-900'}`}>
                {t('subscribeTitle')}
            </h3>
            <p className={`text-xs ${variant === 'footer' ? 'text-white/70' : 'text-slate-500'}`}>
                {t('subscribeSubtitle')}
            </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={14} className={variant === 'footer' ? 'text-white/30' : 'text-slate-400'} />
            </div>
            <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`${t('namePlaceholder')} *`}
            required
            className={`block w-full rounded-lg py-3 pl-10 pr-4 text-sm focus:ring-2 focus:outline-none transition-all ${inputBgClass}`}
            style={variant === 'footer' ? { outlineColor: theme.primaryColor } : {}}
            />
        </div>

        <div className="relative">
            <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={`${t('emailPlaceholder')} *`}
            required
            className={`block w-full rounded-lg py-3 pl-4 pr-4 text-sm focus:ring-2 focus:outline-none transition-all ${inputBgClass}`}
            style={variant === 'footer' ? { outlineColor: theme.primaryColor } : {}}
            />
        </div>
        
        <div className="relative">
            <input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder={`${t('whatsappPlaceholder')} *`}
            required
            className={`block w-full rounded-lg py-3 pl-4 pr-4 text-sm focus:ring-2 focus:outline-none transition-all ${inputBgClass}`}
            style={variant === 'footer' ? { outlineColor: theme.primaryColor } : {}}
            />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-3 rounded-lg flex items-center justify-center text-white font-medium transition-colors disabled:opacity-70 mt-2"
          style={{ backgroundColor: theme.primaryColor }}
        >
          {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <>{t('subscribeButton')} <ArrowRight size={16} className="ml-2" /></>}
        </button>
      </form>

      {status === 'error' && <p className="text-red-400 text-xs mt-2">{message}</p>}
      
      <p className={`text-[10px] mt-3 ${variant === 'footer' ? 'text-white/40' : 'text-slate-400'}`}>
          {t('disclaimer')}
      </p>
    </div>
  );
};
