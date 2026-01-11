
'use client';
import React, { useState, useEffect } from 'react';
import { X, Save, Split, Tag, ShieldCheck } from 'lucide-react';

interface ConditionPickerModalProps {
  isOpen: boolean;
  initialTarget?: string;
  initialOperator?: string;
  initialValue?: string;
  onClose: () => void;
  onSave: (target: string, operator: string, value: string) => void;
}

export const ConditionPickerModal: React.FC<ConditionPickerModalProps> = ({ 
    isOpen, 
    initialTarget, 
    initialOperator, 
    initialValue, 
    onClose, 
    onSave 
}) => {
  const [target, setTarget] = useState('tags');
  const [operator, setOperator] = useState('contains');
  const [value, setValue] = useState('');

  useEffect(() => {
    if (isOpen) {
        setTarget(initialTarget || 'tags');
        setOperator(initialOperator || 'contains');
        setValue(initialValue || '');
    }
  }, [isOpen, initialTarget, initialOperator, initialValue]);

  const handleSave = () => {
      if (!value.trim()) {
          alert("O valor da condição é obrigatório.");
          return;
      }
      onSave(target, operator, value);
      onClose();
  };

  return isOpen ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-slate-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
                <Split size={20} className="text-purple-600" /> Regra Lógica
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="p-8 space-y-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Verificar Campo</label>
                    <select 
                        value={target}
                        onChange={e => setTarget(e.target.value)}
                        className="w-full rounded-xl border-slate-200 py-3 px-4 text-sm focus:ring-4 focus:ring-purple-50 outline-none border transition-all"
                    >
                        <option value="tags">Tags do Lead</option>
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Operador</label>
                    <select 
                        value={operator}
                        onChange={e => setOperator(e.target.value)}
                        className="w-full rounded-xl border-slate-200 py-3 px-4 text-sm focus:ring-4 focus:ring-purple-50 outline-none border transition-all"
                    >
                        <option value="contains">Contém</option>
                        <option value="not_contains">NÃO Contém</option>
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Valor Comparado</label>
                    <div className="relative">
                        <Tag size={16} className="absolute top-3.5 left-4 text-slate-400" />
                        <input 
                            type="text"
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            placeholder="ex: cliente_vip"
                            className="w-full rounded-xl border-slate-200 py-3 pl-12 pr-4 text-sm focus:ring-4 focus:ring-purple-50 outline-none border transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl flex gap-3 items-start">
                <ShieldCheck size={16} className="text-purple-600 shrink-0 mt-0.5" />
                <p className="text-xs text-purple-800 leading-relaxed">
                    Se o lead <strong>{operator === 'contains' ? 'possuir' : 'não possuir'}</strong> a tag <strong>"{value || '...'}"</strong>, o fluxo seguirá pelo caminho verde (Sim). Caso contrário, seguirá pelo vermelho (Não).
                </p>
            </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/30">
            <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancelar</button>
            <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-purple-600 text-white px-8 py-2.5 rounded-xl text-sm font-black hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all active:scale-95"
            >
                <Save size={18} /> Aplicar Regra
            </button>
        </div>
      </div>
    </div>
  ) : null;
};
