
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'pt-BR' | 'en' | 'es';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

export const translations: Translations = {
  subscribeTitle: {
    'pt-BR': 'Inscreva-se para atualizações',
    'en': 'Subscribe to updates',
    'es': 'Suscríbete para actualizaciones'
  },
  subscribeSubtitle: {
    'pt-BR': 'Receba as últimas notícias de IA diretamente no seu e-mail.',
    'en': 'Get the latest AI news directly in your inbox.',
    'es': 'Recibe las últimas notícias de IA directamente en tu bandeja de entrada.'
  },
  namePlaceholder: {
    'pt-BR': 'Seu nome completo',
    'en': 'Your full name',
    'es': 'Tu nombre completo'
  },
  emailPlaceholder: {
    'pt-BR': 'seu@email.com',
    'en': 'your@email.com',
    'es': 'tu@correo.com'
  },
  whatsappPlaceholder: {
    'pt-BR': 'WhatsApp (Obrigatório) ex: 55119...',
    'en': 'WhatsApp (Required) ex: 55119...',
    'es': 'WhatsApp (Obligatorio) ej: 55119...'
  },
  subscribeButton: {
    'pt-BR': 'Inscrever-se',
    'en': 'Subscribe',
    'es': 'Suscribirse'
  },
  successTitle: {
    'pt-BR': 'Sucesso!',
    'en': 'Success!',
    'es': '¡Éxito!'
  },
  successMessage: {
    'pt-BR': 'Obrigado por se juntar a nós.',
    'en': 'Thanks for joining.',
    'es': 'Gracias por unirte.'
  },
  disclaimer: {
    'pt-BR': 'Nós cuidamos dos seus dados. Cancele a qualquer momento.',
    'en': 'We care about your data. Unsubscribe at any time.',
    'es': 'Cuidamos tus datos. Cancela en cualquier momento.'
  },
  newsLink: {
    'pt-BR': 'Notícias',
    'en': 'News',
    'es': 'Noticias'
  },
  dashboardLink: {
    'pt-BR': 'Painel',
    'en': 'Dashboard',
    'es': 'Tablero'
  },
  readMore: {
    'pt-BR': 'Ler mais',
    'en': 'Read more',
    'es': 'Leer más'
  },
  latestStories: {
    'pt-BR': 'Últimas Histórias',
    'en': 'Latest Stories',
    'es': 'Últimas Histórias'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'pt-BR',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('pt-BR');

  useEffect(() => {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('en')) setLanguageState('en');
    else if (browserLang.startsWith('es')) setLanguageState('es');
    else setLanguageState('pt-BR');
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
