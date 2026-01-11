import React, { useState } from 'react';
import { dbService } from '../services/dbService';
import { Link } from 'react-router-dom';
import { Hammer, Terminal, ArrowLeft, CheckCircle, XCircle, Loader2, Info } from 'lucide-react';

export const AdminManualMigration: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link to="/admin/debug" className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Migração do Banco</h1>
          <p className="text-slate-500 mt-1">Status da migração do schema do banco de dados.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 mb-4 shadow-inner">
          <Hammer size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Migrações Desativadas</h2>
        <p className="text-slate-500 mt-2 mb-6 max-w-md mx-auto">A aplicação está em modo local e não requer migrações de banco de dados.</p>
        
        <button
          disabled
          className="bg-slate-300 text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 mx-auto cursor-not-allowed"
        >
          <Hammer size={20} />
          Iniciar Migração
        </button>
      </div>

      <div className="bg-slate-900 p-6 rounded-[2rem] font-mono text-xs shadow-2xl border-4 border-slate-800">
          <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
              <h4 className="text-white font-bold flex items-center gap-3">
                  <Terminal size={16} /> Console de Saída
              </h4>
              <div className="flex items-center gap-2 text-green-400 font-bold"><CheckCircle size={16}/> Ocioso</div>
          </div>
          <div className="space-y-1.5 text-slate-300">
             <div className="flex gap-3 items-start">
                <span className="text-slate-600 select-none">[1]</span>
                <span className="flex-1 break-words">Modo LocalStorage Ativo. Nenhuma ação de migração é necessária.</span>
              </div>
          </div>
      </div>
    </div>
  );
};