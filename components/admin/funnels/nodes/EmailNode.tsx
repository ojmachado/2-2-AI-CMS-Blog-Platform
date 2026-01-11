
'use client';
import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { Edit2, Mail, Trash2 } from 'lucide-react';

const EmailNode = ({ id, data, isConnectable }: NodeProps) => {
  const { setNodes } = useReactFlow();

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Deseja remover este passo de e-mail?")) {
      setNodes((nodes) => nodes.filter((node) => node.id !== id));
    }
  };

  return (
    <div className="relative group">
      {/* Professional Blue Theme for Email */}
      <div className="w-[160px] h-[60px] bg-white border border-slate-200 border-l-[6px] border-l-blue-600 rounded-xl shadow-lg flex items-center px-4 overflow-hidden transition-all hover:shadow-xl hover:border-blue-200">
        <div className="mr-3 p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <Mail size={18} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider leading-tight select-none">
                E-mail
            </span>
            <span className="text-[11px] font-bold text-slate-700 truncate leading-tight select-none">
                {data.subject || 'Configurar Assunto'}
            </span>
        </div>
      </div>

      <Handle 
        type="target" 
        position={Position.Left} 
        isConnectable={isConnectable} 
        className="!bg-slate-400 !w-3 !h-3 !border-2 !border-white shadow-sm" 
      />
      
      {/* Botão de Excluir */}
      <button 
        onClick={onDelete}
        className="hidden group-hover:flex absolute -top-2 -left-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors z-10 animate-in zoom-in"
        title="Remover Nó"
      >
        <Trash2 size={12} />
      </button>

      {/* Botão de Edição */}
      <button 
        onClick={(e) => {
            e.stopPropagation();
            data.onEdit?.();
        }}
        className="hidden group-hover:flex absolute -top-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-10 animate-in zoom-in"
        title="Configurar E-mail"
      >
        <Edit2 size={12} />
      </button>

      <Handle 
        type="source" 
        position={Position.Right} 
        isConnectable={isConnectable} 
        className="!bg-slate-400 !w-3 !h-3 !border-2 !border-white shadow-sm" 
      />
    </div>
  );
};

export default memo(EmailNode);
