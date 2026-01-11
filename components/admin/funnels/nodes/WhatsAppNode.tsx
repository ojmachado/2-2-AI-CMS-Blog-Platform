
import React, { memo } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { MessageCircle, Edit2, Clock, Trash2 } from 'lucide-react';

const WhatsAppNode = ({ id, data, isConnectable }: NodeProps) => {
  const { setNodes } = useReactFlow();

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Deseja remover este nó?")) {
      setNodes((nodes) => nodes.filter((node) => node.id !== id));
    }
  };

  return (
    <div className="relative group">
      {/* Dimensões Estritas 128x50px */}
      <div className="w-[128px] h-[50px] bg-white border-l-4 border-green-500 rounded shadow-sm flex items-center px-3 overflow-hidden transition-all hover:shadow-md">
        <div className="mr-2 text-green-600 shrink-0">
          <MessageCircle size={16} />
        </div>
        <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-800 truncate leading-tight select-none">
                    WhatsApp
                </span>
                {data.sendTime && (
                    <div className="flex items-center text-[8px] bg-amber-50 text-amber-600 px-1 rounded border border-amber-100">
                        <Clock size={8} className="mr-0.5" /> {data.sendTime}
                    </div>
                )}
            </div>
            <span className="text-[9px] text-slate-400 truncate leading-tight select-none">
                {data.label || 'Selecionar...'}
            </span>
        </div>
      </div>

      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="!bg-slate-400 w-2 h-2 !border-white" />
      
      {/* Botão de Excluir */}
      <button 
        onClick={onDelete}
        className="hidden group-hover:flex absolute -top-2 -left-2 bg-red-500 text-white p-1 rounded-full shadow-sm hover:bg-red-600 transition-colors z-10 animate-in zoom-in"
        title="Remover Nó"
      >
        <Trash2 size={10} />
      </button>

      {/* Edit Button (Visible on Hover) */}
      <button 
        onClick={(e) => {
            e.stopPropagation();
            data.onEdit();
        }}
        className="hidden group-hover:flex absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-sm hover:bg-green-600 transition-colors z-10 animate-in zoom-in"
        title="Configurar Mensagem"
      >
        <Edit2 size={10} />
      </button>

      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="!bg-slate-400 w-2 h-2 !border-white" />
    </div>
  );
};

export default memo(WhatsAppNode);
