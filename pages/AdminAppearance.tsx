import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeSettings } from '../types';
import { Save, Palette, Layout, Type } from 'lucide-react';

export const AdminAppearance: React.FC = () => {
  const { theme, updateTheme } = useTheme();
  const [localTheme, setLocalTheme] = useState<ThemeSettings>(theme);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Sync state when context loads
  useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalTheme(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      await updateTheme(localTheme);
      setMessage("Theme updated successfully! The site look has changed.");
    } catch (error) {
      setMessage("Failed to update theme.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Appearance & Branding</h1>
        <p className="text-slate-500 mt-1">Customize the colors, logo, and identity of your news portal.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-8">
        
        {message && (
          <div className={`p-4 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* Brand Identity */}
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Layout size={18} /> Brand Identity
            </h3>
            
            <div className="grid gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Site Name
                    </label>
                    <input
                        type="text"
                        name="siteName"
                        value={localTheme.siteName}
                        onChange={handleChange}
                        className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 border"
                        placeholder="My Awesome News"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Logo URL
                    </label>
                    <input
                        type="text"
                        name="logoUrl"
                        value={localTheme.logoUrl}
                        onChange={handleChange}
                        className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 border"
                        placeholder="https://example.com/logo.png"
                    />
                    <p className="text-xs text-slate-500 mt-1">Leave empty to use Site Name text.</p>
                </div>
            </div>
        </div>

        {/* Color Scheme */}
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Palette size={18} /> Color Scheme
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Primary Color (Header & Highlights)
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            name="primaryColor"
                            value={localTheme.primaryColor}
                            onChange={handleChange}
                            className="h-12 w-24 rounded cursor-pointer border-0 p-0 shadow-sm ring-1 ring-slate-200"
                        />
                        <span className="text-sm text-slate-500 font-mono">{localTheme.primaryColor}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Used for the navbar background and main category tags.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Secondary Color (Accents)
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            name="secondaryColor"
                            value={localTheme.secondaryColor}
                            onChange={handleChange}
                            className="h-12 w-24 rounded cursor-pointer border-0 p-0 shadow-sm ring-1 ring-slate-200"
                        />
                         <span className="text-sm text-slate-500 font-mono">{localTheme.secondaryColor}</span>
                    </div>
                     <p className="text-xs text-slate-500 mt-2">Used for links, secondary buttons, and details.</p>
                </div>
            </div>
        </div>
        
        {/* Preview Box */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mt-4">
            <span className="text-xs font-semibold text-slate-400 uppercase">Preview Elements</span>
            <div className="mt-3 flex items-center gap-4 flex-wrap">
                <div 
                    className="px-4 py-2 rounded text-white font-bold"
                    style={{ backgroundColor: localTheme.primaryColor }}
                >
                    Navbar / Tag
                </div>
                <div 
                    className="px-4 py-2 rounded text-white font-medium"
                    style={{ backgroundColor: localTheme.secondaryColor }}
                >
                    Button / Link
                </div>
                <div className="font-bold text-xl" style={{ color: localTheme.primaryColor }}>
                    Headline Text
                </div>
            </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
            style={{ backgroundColor: localTheme.primaryColor }}
          >
            <Save size={18} className="mr-2" />
            {isSaving ? 'Updating...' : 'Save Appearance'}
          </button>
        </div>
      </form>
    </div>
  );
};