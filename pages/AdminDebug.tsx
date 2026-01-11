import React, { useEffect, useState } from 'react';
import { dbService } from '../services/dbService';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, AlertTriangle, RefreshCw, Database, Server, Info, Link as LinkIcon, XCircle, Key, Search, Zap, Terminal, Hammer } from 'lucide-react';

export const AdminDebug: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkDb = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dbService.checkConnection();
      setStatus(res);
    } catch (err: any) {
      setError(err.message || "Connection Failed");
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
                <Shield className="text-indigo-600" /> Diagnóstico Avançado
            </h1>
            <p className="text-slate-500 mt-1 text-lg">Análise profunda da conectividade Neon/Vercel.</p>
        </div>
        <div className="flex gap-3">
            <Link 
                to="/admin/migration"
                className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-amber-700 transition-all shadow-xl shadow-amber-100 active:scale-95"
            >
                <Hammer size={18} /> Painel de Migração
            </Link>
            <a 
                href="/neon" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
                <Terminal size={18} /> Testar Server Actions
            </a>
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
        
        {/* Status Geral */}
        <div className={`p-8 rounded-[2.5rem] border flex items-center gap-6 shadow-sm transition-colors ${status?.connected ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
            <div className={`p-4 rounded-2xl ${status?.connected ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {status?.connected ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
            </div>
            <div>
                <h3 className={`text-2xl font-black ${status?.connected ? 'text-green-800' : 'text-red-800'}`}>
                    {status?.connected ? 'Conexão Operacional' : 'Banco de Dados Offline'}
                </h3>
                <p className={`mt-1 font-medium ${status?.connected ? 'text-green-700' : 'text-red-700'}`}>
                    {status?.connected 
                        ? 'O sistema conseguiu se conectar e consultar o banco de dados via API.' 
                        : 'Não foi possível estabelecer conexão via API. Revise as credenciais e logs.'}
                </p>
            </div>
        </div>

        {/* Database Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-lg">
                    <Database size={20} className="text-indigo-600" /> Detalhes Técnicos
                </h3>
                
                {status?.error && (
                    <div className="mb-6 p-5 bg-red-50 text-red-800 rounded-2xl border border-red-100 font-mono text-xs overflow-auto">
                        <strong className="block mb-2 font-black uppercase tracking-widest flex items-center gap-2"><XCircle size={14}/> Erro Reportado:</strong>
                        {status.error}
                        {status.error.includes('API Unreachable') && (
                            <div className="mt-4 pt-3 border-t border-red-200 text-red-900">
                                <strong className="font-sans font-bold">Ação Recomendada:</strong>
                                <p className="font-sans">Este erro indica que a API do backend (`/api/nile`) falhou criticamente (crash) e não retornou uma resposta JSON. Verifique os logs da função correspondente no painel da Vercel para encontrar o erro exato que causou a falha.</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-sm font-bold text-slate-500">Database Name</span>
                        <span className="font-mono text-sm font-bold text-slate-900">{status?.database || 'Indisponível'}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-sm font-bold text-slate-500">Postgres Version</span>
                        <span className="font-mono text-xs font-bold text-slate-900 truncate max-w-[200px]" title={status?.version}>{status?.version || 'Indisponível'}</span>
                    </div>
                    <div className="flex flex-col p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 gap-2">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                            <Key size={12}/> Connection Key Usada
                        </span>
                        <span className="font-mono text-xs font-bold text-indigo-700 break-all">
                            {status?.diagnostics?.activeKey || 'NENHUMA'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-center text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Server size={32} />
                </div>
                <h4 className="font-black text-slate-900 text-lg">Infraestrutura</h4>
                <p className="text-slate-500 text-sm mt-1 font-medium">
                    Standard Postgres
                </p>
                <div className="mt-6 pt-6 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">DRIVER STATUS</p>
                    <span className={`text-lg font-black ${status?.connected ? 'text-green-600' : 'text-red-400'}`}>
                       {status?.connected ? 'Conectado' : (status?.error ? 'Falha' : 'Offline')}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">{status?.diagnostics?.driver || 'N/A'}</p>
                </div>
            </div>
        </div>

        {/* Checklist de Variáveis */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-lg">
                <LinkIcon size={20} className="text-indigo-600" /> Checklist: Variáveis de Ambiente (Vercel)
            </h3>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">Variável Esperada</th>
                            <th className="pb-4 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-mono">
                        {status?.diagnostics?.envStatus && Object.entries(status.diagnostics.envStatus).sort().map(([key, val]: [string, any]) => (
                            <tr key={key} className={`group hover:bg-slate-50 transition-colors ${val === 'Missing' ? 'opacity-50' : 'opacity-100'}`}>
                                <td className="py-3 border-b border-slate-50 text-xs text-slate-600 truncate max-w-lg flex items-center gap-2" title={key}>
                                    {key.includes('PASSWORD') || key.includes('KEY') ? <Key size={12} className="text-slate-400"/> : <div className="w-3" />}
                                    {key}
                                </td>
                                <td className="py-3 border-b border-slate-50 text-right">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                                        val.toLowerCase().includes('missing')
                                            ? 'bg-slate-100 text-slate-400' 
                                            : val.toLowerCase().includes('ssl missing') ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-green-50 text-green-700 border border-green-100'
                                    }`}>
                                        {val.toLowerCase().includes('missing') ? <XCircle size={10}/> : val.toLowerCase().includes('ssl missing') ? <AlertTriangle size={10} /> : <CheckCircle size={10}/>}
                                        {val}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="mt-6 bg-slate-50 border border-slate-100 p-4 rounded-2xl flex gap-3">
                <Info size={20} className="text-slate-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 leading-relaxed">
                    <strong className="block mb-1 text-slate-900">Como corrigir erros de conexão no Neon:</strong>
                    1. Verifique se o final da sua URL contém <code>?sslmode=require</code>. O Neon <strong>exige</strong> SSL.<br/>
                    2. Se estiver rodando localmente (`npm run dev`), rode <code>vc env pull .env.local</code> para baixar as chaves corretas.<br/>
                    3. Se o erro for "column does not exist", use o botão <strong>Painel de Migração</strong> acima.
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
