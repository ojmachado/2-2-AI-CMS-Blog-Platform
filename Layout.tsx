
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, LayoutDashboard, PenTool, Github, Sparkles, Settings } from 'lucide-react';
import { MarketingScripts } from './MarketingScripts';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Inject Marketing Scripts Global */}
      <MarketingScripts />

      {/* Navigation */}
      <nav className={`${isAdmin ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border-b border-slate-200'} sticky top-0 z-50 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className={`p-2 rounded-lg ${isAdmin ? 'bg-indigo-500' : 'bg-indigo-600'} text-white group-hover:scale-105 transition-transform`}>
                <Sparkles size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight">AI<span className="font-light opacity-80">Blog</span></span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${!isAdmin ? 'bg-slate-100 text-indigo-600' : 'hover:bg-slate-800'}`}
              >
                <BookOpen size={16} />
                <span>Reader View</span>
              </Link>
              
              <Link 
                to="/admin" 
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isAdmin ? 'bg-slate-800 text-indigo-400' : 'hover:bg-slate-50'}`}
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>

              {isAdmin && (
                <Link 
                  to="/admin/settings" 
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-800 text-slate-300 hover:text-white"
                >
                  <Settings size={16} />
                  <span>Integrations</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button (Simplified for this demo) */}
            <div className="md:hidden flex items-center gap-4">
               {isAdmin && (
                   <Link to="/admin/settings" className="p-2">
                       <Settings size={24} />
                   </Link>
               )}
                <Link to={isAdmin ? "/" : "/admin"} className="p-2">
                    {isAdmin ? <BookOpen size={24} /> : <LayoutDashboard size={24}/>}
                </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p className="flex justify-center items-center gap-2 mb-2">
            Built with React, Gemini 3, and Tailwind CSS.
          </p>
          <p>© {new Date().getFullYear()} AI CMS Platform.</p>
        </div>
      </footer>
    </div>
  );
};
