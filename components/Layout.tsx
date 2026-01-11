
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  LayoutDashboard, 
  Settings, 
  Palette, 
  LogOut, 
  LogIn, 
  Users, 
  Trello, 
  MessageSquare, 
  Mail, 
  GitFork, 
  Layout as LayoutIcon, 
  Globe,
  PlusCircle
} from 'lucide-react';
import { MarketingScripts } from './MarketingScripts';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { NewsletterForm } from './NewsletterForm';
import { useLanguage } from '../contexts/LanguageContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const handleLogout = () => {
    logout();
  };

  const navItemClass = (path: string) => {
    const isActive = location.pathname === path;
    return `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
        : isAdminPath 
          ? 'text-slate-400 hover:bg-slate-800 hover:text-white' 
          : 'text-white/80 hover:bg-white/10 hover:text-white'
    }`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <MarketingScripts />

      {/* Top Navigation */}
      <nav 
        className={`${isAdminPath ? 'bg-slate-900 text-white' : 'text-white transition-colors duration-300 shadow-sm sticky top-0 z-[100]'}`}
        style={!isAdminPath ? { backgroundColor: theme.primaryColor } : {}}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            <Link to="/" className="flex items-center space-x-2 group">
              {theme.logoUrl ? (
                  <img src={theme.logoUrl} alt={theme.siteName} className="h-8 w-auto object-contain bg-white/10 rounded p-1" />
              ) : (
                  <span className="font-bold text-2xl tracking-tighter italic">
                      {theme.siteName}
                  </span>
              )}
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-2">
              <Link to="/" className={navItemClass('/')}>
                <BookOpen size={16} />
                <span>{t('newsLink')}</span>
              </Link>
              
              {user && (
                <>
                  <Link to="/admin" className={navItemClass('/admin')}>
                    <LayoutDashboard size={16} />
                    <span>{t('dashboardLink')}</span>
                  </Link>
                  <Link to="/admin/crm" className={navItemClass('/admin/crm')}>
                    <Trello size={16} />
                    <span>CRM</span>
                  </Link>
                  <Link to="/admin/funnels" className={navItemClass('/admin/funnels')}>
                    <GitFork size={16} />
                    <span>Funis</span>
                  </Link>
                  <Link to="/admin/whatsapp" className={navItemClass('/admin/whatsapp')}>
                    <MessageSquare size={16} />
                    <span>WhatsApp</span>
                  </Link>
                  <Link to="/admin/email" className={navItemClass('/admin/email')}>
                    <Mail size={16} />
                    <span>E-mail</span>
                  </Link>
                  <Link to="/admin/landing" className={navItemClass('/admin/landing')}>
                    <LayoutIcon size={16} />
                    <span>Landings</span>
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              {!isAdminPath && (
                <div className="flex items-center bg-black/10 rounded-full p-1 border border-white/20">
                    <button 
                        onClick={() => setLanguage('pt-BR')} 
                        className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${language === 'pt-BR' ? 'bg-white text-slate-900 shadow-sm' : 'text-white hover:bg-white/10'}`}
                    >
                        PT
                    </button>
                    <button 
                        onClick={() => setLanguage('en')} 
                        className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${language === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-white hover:bg-white/10'}`}
                    >
                        EN
                    </button>
                    <button 
                        onClick={() => setLanguage('es')} 
                        className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${language === 'es' ? 'bg-white text-slate-900 shadow-sm' : 'text-white hover:bg-white/10'}`}
                    >
                        ES
                    </button>
                </div>
              )}

              <div className="flex items-center space-x-2">
                {user ? (
                    <div className="flex items-center gap-2">
                      {isAdminPath && (
                        <div className="hidden md:flex gap-1 border-r border-slate-700 pr-2 mr-2">
                          <Link to="/admin/users" className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors" title="Usuários">
                            <Users size={18} />
                          </Link>
                          <Link to="/admin/appearance" className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors" title="Aparência">
                            <Palette size={18} />
                          </Link>
                          <Link to="/admin/settings" className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors" title="Configurações">
                            <Settings size={18} />
                          </Link>
                        </div>
                      )}
                      <button 
                          onClick={handleLogout}
                          className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isAdminPath ? 'text-red-400 hover:bg-slate-800' : 'text-white/80 hover:bg-white/10'}`}
                      >
                          <LogOut size={16} />
                          <span className="hidden sm:inline">Sair</span>
                      </button>
                    </div>
                ) : (
                    <Link 
                        to="/login"
                        className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isAdminPath ? 'text-white' : 'text-white/90 hover:bg-white/10'}`}
                    >
                        <LogIn size={16} />
                        <span>Login</span>
                    </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Mobile Quick Access Bar */}
      {user && isAdminPath && (
        <div className="lg:hidden bg-slate-800 border-b border-slate-700 flex overflow-x-auto no-scrollbar px-4 py-2 gap-2">
            <Link to="/admin" className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-700 text-xs font-bold text-white">Painel</Link>
            <Link to="/admin/crm" className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-700 text-xs font-bold text-white">CRM</Link>
            <Link to="/admin/funnels" className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-700 text-xs font-bold text-white">Funis</Link>
            <Link to="/admin/whatsapp" className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-700 text-xs font-bold text-white">WhatsApp</Link>
            <Link to="/admin/email" className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-700 text-xs font-bold text-white">E-mail</Link>
            <Link to="/admin/landing" className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-700 text-xs font-bold text-white">Landings</Link>
        </div>
      )}

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {!isAdminPath && (
        <footer className="bg-slate-900 text-white pt-16 pb-8 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                <div className="col-span-1 lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-4" style={{ color: theme.primaryColor }}>{theme.siteName}</h2>
                    <p className="text-slate-400 max-w-sm mb-6">
                        Empowering the world with the latest AI news and insights. Stay ahead of the curve.
                    </p>
                    <NewsletterForm variant="footer" />
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 text-center text-slate-600 text-sm pt-8 border-t border-slate-800">
                <p>© {new Date().getFullYear()} {theme.siteName}. Todos os direitos reservados.</p>
            </div>
        </footer>
      )}
    </div>
  );
};
