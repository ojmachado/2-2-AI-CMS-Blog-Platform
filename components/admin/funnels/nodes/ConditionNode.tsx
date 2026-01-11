
'use client';
import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { Edit2, Split, Check, X, Trash2 } from 'lucide-react';

const ConditionNode = ({ id, data, isConnectable }: NodeProps) => {
  const { setNodes } = useReactFlow();

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Deseja remover esta regra lógica?")) {
      setNodes((nodes) => nodes.filter((node) => node.id !== id));
    }
  };

  return (
    <div className="relative group">
      {/* Dimensões Estritas 128x70px para nó bifurcado */}
      <div className="w-[140px] h-[70px] bg-white border-l-4 border-purple-500 rounded shadow-sm flex items-center px-3 overflow-hidden transition-all hover:shadow-md">
        <div className="mr-2 text-purple-600 shrink-0">
          <Split size={18} />
        </div>
        <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] font-bold text-slate-800 uppercase leading-tight select-none">
                Bifurcação
            </span>
            <span className="text-[9px] text-slate-400 leading-tight select-none italic truncate mt-1">
                {data.label || 'Regra não definida'}
            </span>
        </div>
      </div>

      {/* Entrada Única */}
      <Handle 
        type="target" 
        position={Position.Left} 
        isConnectable={isConnectable} 
        className="!bg-slate-400 w-2 h-2 !border-white" 
      />
      
      {/* Botão de Excluir */}
      <button 
        onClick={onDelete}
        className="hidden group-hover:flex absolute -top-2 -left-4 bg-red-500 text-white p-1 rounded-full shadow-sm hover:bg-red-600 transition-colors z-10 animate-in zoom-in"
        title="Remover Nó"
      >
        <Trash2 size={10} />
      </button>

      {/* Botão de Edição */}
      <button 
        onClick={(e) => {
            e.stopPropagation();
            data.onEdit?.();
        }}
        className="hidden group-hover:flex absolute -top-2 -left-2 bg-purple-500 text-white p-1 rounded-full shadow-sm hover:bg-purple-600 transition-colors z-10 animate-in zoom-in"
        style={{ left: '-8px' }}
        title="Configurar Regra"
      >
        <Edit2 size={10} />
      </button>

      {/* Saída TRUE (Superior) */}
      <div className="absolute -right-1 top-2 flex items-center gap-1.5">
          <span className="text-[8px] font-black text-green-600 uppercase">Sim</span>
          <Handle 
            id="true"
            type="source" 
            position={Position.Right} 
            isConnectable={isConnectable} 
            className="!bg-green-500 w-3 h-3 !border-white !static" 
          />
      </div>

      {/* Saída FALSE (Inferior) */}
      <div className="absolute -right-1 bottom-2 flex items-center gap-1.5">
          <span className="text-[8px] font-black text-red-600 uppercase">Não</span>
          <Handle 
            id="false"
            type="source" 
            position={Position.Right} 
            isConnectable={isConnectable} 
            className="!bg-red-500 w-3 h-3 !border-white !static" 
          />
      </div>
    </div>
  );
};

export default memo(ConditionNode);
