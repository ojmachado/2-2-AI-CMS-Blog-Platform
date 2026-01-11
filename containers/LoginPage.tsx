import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { AuthStep } from '../types';
import { Sparkles, User, Lock, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();

  const [step, setStep] = useState<AuthStep>(AuthStep.EMAIL);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const nextStep = await authService.checkEmailStatus(email);
      setStep(nextStep);
    } catch (err) { alert("Erro de conexão."); }
    finally { setIsLoading(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // FIX: The login function from the useAuth context should be called with email and password.
      // It handles both the auth service call and updating the application state.
      await login(email, password);
      navigate('/admin');
    } catch (err) { alert("Senha inválida."); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
        <div className="text-center mb-10"><Sparkles className="mx-auto text-indigo-600 mb-4" size={32} /><h2 className="text-3xl font-black text-slate-900">Portal Admin</h2></div>
        {step === AuthStep.EMAIL ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border-slate-200 py-4 px-4 shadow-sm" placeholder="seu@email.com" />
                <button type="submit" disabled={isLoading} className="w-full py-4 rounded-2xl text-white font-black" style={{ backgroundColor: theme.primaryColor }}>{isLoading ? <RefreshCw className="animate-spin mx-auto" size={18} /> : 'Continuar'}</button>
            </form>
        ) : (
            <form onSubmit={handleLogin} className="space-y-6">
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border-slate-200 py-4 px-4 shadow-sm" placeholder="Senha" />
                <button type="submit" disabled={isLoading} className="w-full py-4 rounded-2xl text-white font-black" style={{ backgroundColor: theme.primaryColor }}>{isLoading ? <RefreshCw className="animate-spin mx-auto" size={18} /> : 'Entrar'}</button>
            </form>
        )}
      </div>
    </div>
  );
};
