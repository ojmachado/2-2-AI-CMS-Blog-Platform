
'use client';
import React, { useState, useEffect } from 'react';
import { X, Save, Clock } from 'lucide-react';

interface DelayPickerModalProps {
  isOpen: boolean;
  initialHours?: number;
  onClose: () => void;
  onSave: (hours: number) => void;
}

export const DelayPickerModal: React.FC<DelayPickerModalProps> = ({ isOpen, initialHours, onClose, onSave }) => {
  const [hours, setHours] = useState(24);

  useEffect(() => {
    if (isOpen) {
        setHours(initialHours || 24);
    }
  }, [isOpen, initialHours]);

  const handleSave = () => {
      if (hours < 1) {
          alert("O tempo mínimo é de 1 hora.");
          return;
      }
      onSave(hours);
      onClose();
  };

  return isOpen ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
                <Clock size={20} className="text-amber-500" /> Configurar Espera
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="p-8 space-y-6">
            <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">Tempo de Atraso (Horas)</label>
                <div className="flex items-center gap-4">
                    <input 
                        type="range"
                        min="1"
                        max="168"
                        step="1"
                        value={hours}
                        onChange={e => setHours(Number(e.target.value))}
                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="w-20 text-center bg-slate-900 text-white py-2 rounded-xl font-mono font-bold">
                        {hours}h
                    </div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1">
                    <span>1 HORA</span>
                    <span>1 SEMANA</span>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 items-start">
                <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                    O sistema aguardará exatamente <strong>{hours} horas</strong> antes de prosseguir para o próximo passo do funil.
                    {hours >= 24 && ` (~${Math.floor(hours/24)} dias)`}
                </p>
            </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/30">
            <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancelar</button>
            <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-amber-500 text-white px-8 py-2.5 rounded-xl text-sm font-black hover:bg-amber-600 shadow-lg shadow-amber-100 transition-all active:scale-95"
            >
                <Save size={18} /> Aplicar Tempo
            </button>
        </div>
      </div>
    </div>
  ) : null;
};
