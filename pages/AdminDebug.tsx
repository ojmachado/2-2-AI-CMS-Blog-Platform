import React, { useEffect, useState } from 'react';
import { dbService } from '../services/dbService';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, AlertTriangle, RefreshCw, Database, Server, Info, Link as LinkIcon, XCircle, Key, Search, Zap, Terminal, Hammer } from 'lucide-react';

export const AdminDebug: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkDb = async () => {
    setLoading(true);
    try {
      const res = await dbService.checkConnection();
      setStatus(res);
    } catch (err: any) {
      setStatus({ connected: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDb();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                <Shield className="text-indigo-600" /> Diagnóstico do Sistema
            </h1>
            <p className="text-slate-500 mt-1 text-lg">Análise do estado da aplicação e armazenamento local.</p>
        </div>
        <div className="flex gap-3">
            <Link 
                to="/admin/migration"
                className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-amber-700 transition-all shadow-xl shadow-amber-100 active:scale-95"
            >
                <Hammer size={18} /> Painel de Migração
            </Link>
            <button 
                onClick={checkDb} 
                disabled={loading}
                className="flex items-center gap-2 bg-white border border-slate-200 text-indigo-600 px-6 py-3 rounded-2xl font-bold hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm active:scale-95"
            >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} /> Recarregar
            </button>
        </div>
      </div>

      <div className="grid gap-8">
        <div className="p-8 rounded-[2.5rem] border flex items-center gap-6 shadow-sm bg-green-50 border-green-100">
            <div className="p-4 rounded-2xl bg-green-100 text-green-600">
                <CheckCircle size={32} />
            </div>
            <div>
                <h3 className="text-2xl font-black text-green-800">
                    Sistema Operacional
                </h3>
                <p className="mt-1 font-medium text-green-700">
                    A aplicação está rodando em modo local e usando o LocalStorage do navegador.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-lg">
                    <Database size={20} className="text-indigo-600" /> Detalhes do Armazenamento
                </h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-sm font-bold text-slate-500">Database Name</span>
                        <span className="font-mono text-sm font-bold text-slate-900">{status?.database || 'Indisponível'}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-sm font-bold text-slate-500">Versão</span>
                        <span className="font-mono text-xs font-bold text-slate-900">{status?.version || 'Indisponível'}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-center text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Server size={32} />
                </div>
                <h4 className="font-black text-slate-900 text-lg">Infraestrutura</h4>
                <p className="text-slate-500 text-sm mt-1 font-medium">
                    Client-Side (Navegador)
                </p>
                <div className="mt-6 pt-6 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">DRIVER STATUS</p>
                    <span className="text-lg font-black text-green-600">
                       Ativo
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">{status?.diagnostics?.driver || 'N/A'}</p>
                </div>
            </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex gap-3">
                <Info size={20} className="text-slate-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 leading-relaxed">
                    <strong className="block mb-1 text-slate-900">Modo de Operação Local</strong>
                    A aplicação foi configurada para funcionar sem um banco de dados de backend. Todos os dados (posts, configurações, leads) são salvos diretamente no seu navegador. Limpar os dados do site irá apagar todas as informações.
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};