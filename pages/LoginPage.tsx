import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@local.com');
  const [password, setPassword] = useState('1234');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      if (user) {
        navigate('/admin');
      } else {
        throw new Error("Credenciais inválidas");
      }
    } catch (err: any) {
      setError(err.message || 'Falha no login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-slate-50 relative py-12">
      <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center text-indigo-600 shadow-inner mb-4">
                <Sparkles size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Portal Admin</h2>
          <p className="text-slate-500 mt-2">Acesso via Mock Auth (Local)</p>
      </div>
      
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="admin@local.com" 
            required 
            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Qualquer senha" 
            required 
            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none"
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center transition-colors"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : 'Entrar no Painel'}
        </button>
      </form>
    </div>
  );
};