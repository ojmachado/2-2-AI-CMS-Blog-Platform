import React, { useState } from 'react';
import { dbService } from '../services/dbService';
import { Link } from 'react-router-dom';
import { Hammer, Terminal, ArrowLeft, CheckCircle, XCircle, Loader2, Info } from 'lucide-react';

export const AdminManualMigration: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRunMigration = async () => {
    setIsMigrating(true);
    setError(null);
    setSuccess(false);
    setLogs([]);

    try {
      const result = await dbService.runMigration();
      setLogs(result.logs || []);
      if (result.error) {
        throw new Error(result.error);
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido durante a migração.');
      setLogs(prev => [...prev, `ERRO: ${err.message}`]);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link to="/admin/debug" className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Migração do Banco</h1>
          <p className="text-slate-500 mt-1">Sincronize as tabelas e colunas do seu banco de dados Postgres.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 mb-4 shadow-inner">
          <Hammer size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Atualização de Schema</h2>
        <p className="text-slate-500 mt-2 mb-6 max-w-md mx-auto">Execute este comando se encontrar erros como "table does not exist" ou "column does not exist". É seguro executar múltiplas vezes.</p>
        
        <button
          onClick={handleRunMigration}
          disabled={isMigrating}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mx-auto shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50"
        >
          {isMigrating ? <Loader2 className="animate-spin" size={20} /> : <Hammer size={20} />}
          {isMigrating ? 'Sincronizando...' : 'Iniciar Sincronização'}
        </button>
      </div>

      <div className="bg-slate-900 p-6 rounded-[2rem] font-mono text-xs shadow-2xl border-4 border-slate-800">
          <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
              <h4 className="text-white font-bold flex items-center gap-3">
                  <Terminal size={16} /> Console de Saída
              </h4>
              {isMigrating ? (
                  <div className="flex items-center gap-2 text-amber-400"><Loader2 className="animate-spin" size={16}/> Processando...</div>
              ) : error ? (
                  <div className="flex items-center gap-2 text-red-400 font-bold"><XCircle size={16}/> Falha</div>
              ) : success ? (
                  <div className="flex items-center gap-2 text-green-400 font-bold"><CheckCircle size={16}/> Concluído</div>
              ) : (
                  <div className="flex items-center gap-2 text-slate-400">Ocioso</div>
              )}
          </div>
          <div className="space-y-1.5 text-slate-300 max-h-80 overflow-y-auto">
              {logs.map((log, index) => (
                  <div key={index} className="flex gap-3 items-start">
                      <span className="text-slate-600 select-none">[{index + 1}]</span>
                      <span className={`flex-1 break-words ${log.startsWith('CRITICAL') || log.startsWith('ERRO') ? 'text-red-400' : ''}`}>
                          {log}
                      </span>
                  </div>
              ))}
              {!isMigrating && logs.length === 0 && (
                  <p className="text-slate-500">Aguardando início da migração...</p>
              )}
          </div>
      </div>
    </div>
  );
};