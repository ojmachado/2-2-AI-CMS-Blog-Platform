
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'password' | 'create'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const checkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStep('password');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const mockUser = {
        email: email.toLowerCase(),
        role: 'admin',
        createdAt: new Date().toISOString(),
        lastSignInTime: new Date().toISOString()
      };

      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      router.push('/admin/crm');
    } catch (err: any) {
      setError('Erro ao processar login local.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Portal Admin (Local)</h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Modo Offline / Sem Firebase</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={step === 'email' ? checkEmail : handleAuth} className="space-y-4">
          {step === 'email' && (
            <div>
              <label className="block text-sm font-medium text-slate-700">Email Corporativo</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                placeholder="admin@local.com"
              />
            </div>
          )}

          {(step === 'password' || step === 'create') && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-slate-500">{email}</span>
                <button type="button" onClick={() => setStep('email')} className="text-xs text-indigo-600">Alterar</button>
              </div>
              <label className="block text-sm font-medium text-slate-700">
                Senha (Mock)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                placeholder="Qualquer senha serve"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors"
          >
            {step === 'email' ? 'Continuar' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
