
import React, { useState } from 'react';
import { dbService } from '../services/dbService';
import { Link } from 'react-router-dom';
import { Hammer, Terminal, ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const AdminManualMigration: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleRunMigration = async () => {
    setStatus('running');
    setLogs(['Starting migration process...']);
    setError(null);
    try {
      const result = await dbService.runMigration();
      if (result.success) {
        setLogs(prev => [...prev, ...result.logs, 'Migration completed successfully!']);
        setStatus('success');
      } else {
        const errorMsg = result.error || 'An unknown error occurred.';
        setLogs(prev => [...prev, ...(result.logs || []), `ERROR: ${errorMsg}`]);
        setError(errorMsg);
        setStatus('error');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'A critical client-side error occurred.';
      setLogs(prev => [...prev, `CRITICAL ERROR: ${errorMsg}`]);
      setError(errorMsg);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link to="/admin/debug" className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Migração Manual do Banco</h1>
          <p className="text-slate-500 mt-1">Execute as atualizações de schema do banco de dados manualmente.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 mb-4 shadow-inner">
          <Hammer size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Pronto para Migrar</h2>
        <p className="text-slate-500 mt-2 mb-6 max-w-md mx-auto">Clique no botão abaixo para aplicar as últimas atualizações de tabelas e colunas ao seu banco de dados Neon/Postgres.</p>
        
        <button
          onClick={handleRunMigration}
          disabled={status === 'running'}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
        >
          {status === 'running' ? <Loader2 className="animate-spin" size={20} /> : <Hammer size={20} />}
          {status === 'running' ? 'Migrando Banco de Dados...' : 'Iniciar Migração Agora'}
        </button>
      </div>

      {(logs.length > 0 || status !== 'idle') && (
        <div className="bg-slate-900 p-6 rounded-[2rem] font-mono text-xs shadow-2xl border-4 border-slate-800">
          <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
              <h4 className="text-white font-bold flex items-center gap-3">
                  <Terminal size={16} /> Console de Saída
              </h4>
              {status === 'success' && <div className="flex items-center gap-2 text-green-400 font-bold"><CheckCircle size={16}/> Sucesso</div>}
              {status === 'error' && <div className="flex items-center gap-2 text-red-400 font-bold"><XCircle size={16}/> Falhou</div>}
              {status === 'running' && <div className="flex items-center gap-2 text-amber-400 font-bold animate-pulse"><Loader2 size={16} className="animate-spin"/> Executando...</div>}
          </div>
          <div className="space-y-1.5 max-h-80 overflow-y-auto text-slate-300 custom-scrollbar">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-slate-600 select-none">[{i + 1}]</span>
                <span className={`flex-1 break-words ${log.toLowerCase().includes('error') ? 'text-red-400' : (log.toLowerCase().includes('success') ? 'text-green-400' : '')}`}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
