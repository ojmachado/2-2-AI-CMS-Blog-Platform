
'use client';
import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Panel,
  ReactFlowProvider
} from 'reactflow';
import type { Connection, Edge, Node } from 'reactflow';
import 'reactflow/dist/style.css';
import WhatsAppNode from '../../../../components/admin/funnels/nodes/WhatsAppNode';
import DelayNode from '../../../../components/admin/funnels/nodes/DelayNode';
import EmailNode from '../../../../components/admin/funnels/nodes/EmailNode';
import ButtonEdge from '../../../../components/admin/funnels/edges/ButtonEdge';
import { DelayPickerModal } from '../../../../components/admin/funnels/DelayPickerModal';
import { MessagePickerModal } from '../../../../components/admin/funnels/MessagePickerModal';
import { funnelService } from '../../../../services/funnelService';
import { Funnel, FunnelNode, FunnelNodeType } from '../../../../types';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, CheckCircle, Plus, MessageCircle, Clock, Save, Mail } from 'lucide-react';

const nodeTypes = {
  WHATSAPP: WhatsAppNode,
  DELAY: DelayNode,
  EMAIL: EmailNode
};

const edgeTypes = {
  buttonEdge: ButtonEdge,
};

function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modal State
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [isWAModalOpen, setIsWAModalOpen] = useState(false);

  useEffect(() => {
      // Iniciar com um nó de boas vindas
      const initialId = uuidv4();
      setNodes([{ 
        id: initialId, 
        type: 'WHATSAPP', 
        position: { x: 250, y: 100 }, 
        data: { 
            label: 'Mensagem de Boas Vindas',
            onEdit: () => openEditModal(initialId, 'WHATSAPP') 
        } 
      }]);
  }, []);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({
      ...params,
      type: 'buttonEdge',
      markerEnd: { type: MarkerType.ArrowClosed }
    }, eds)),
    [setEdges]
  );

  const addNode = (type: FunnelNodeType) => {
      const id = uuidv4();
      const newNode: Node = {
          id,
          type,
          position: { x: 400, y: 200 },
          data: { 
              label: type === 'DELAY' ? 'Esperar 24h' : (type === 'WHATSAPP' ? 'Mensagem Zap' : 'Novo E-mail'),
              hours: type === 'DELAY' ? 24 : undefined,
              onEdit: () => openEditModal(id, type)
          }
      };
      setNodes(nds => nds.concat(newNode));
  };

  const openEditModal = (id: string, type: string) => {
      setActiveNodeId(id);
      if (type === 'DELAY') setIsDelayModalOpen(true);
      else if (type === 'WHATSAPP') setIsWAModalOpen(true);
  };

  const onSave = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      const funnelNodes: FunnelNode[] = nodes.map(n => {
        const outgoingEdge = edges.find(e => e.source === n.id);
        const cleanData = { ...n.data };
        delete cleanData.onEdit;
        
        return {
          id: n.id,
          type: n.type as FunnelNodeType,
          position: n.position,
          data: cleanData,
          nextNodeId: outgoingEdge?.target || null
        };
      });

      const targetIds = new Set(edges.map(e => e.target));
      const startNode = funnelNodes.find(n => !targetIds.has(n.id)) || funnelNodes[0];

      const funnelData: Funnel = {
        id: uuidv4(),
        name: "Funil Gerado via Editor",
        trigger: "manual_trigger",
        isActive: true,
        nodes: funnelNodes,
        startNodeId: startNode?.id || ''
      };

      await funnelService.saveFunnel(funnelData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      
    } catch (error) {
      console.error("Erro ao salvar fluxo:", error);
      alert("Falha ao salvar o fluxo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full bg-slate-50 relative">
      <div className="absolute top-4 right-4 z-50 flex items-center gap-4 bg-white/80 backdrop-blur p-2 rounded-2xl border border-slate-200 shadow-xl">
        {saveSuccess && (
          <div className="flex items-center gap-1.5 text-green-600 text-xs font-black uppercase">
            <CheckCircle size={16} /> Salvo!
          </div>
        )}
        <button 
          onClick={onSave}
          disabled={saving}
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Salvar Fluxo
        </button>
      </div>
      
      <div className="h-full w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
        >
          <Background color="#cbd5e1" gap={16} variant="dots" />
          <Controls />
          <Panel position="top-left" className="bg-white/95 backdrop-blur p-2 rounded-2xl shadow-xl border border-slate-200 flex flex-col gap-1 m-4">
              <button onClick={() => addNode('WHATSAPP')} className="p-3 hover:bg-green-50 text-green-600 rounded-xl flex items-center gap-3 transition-colors">
                  <MessageCircle size={18} /> <span className="text-[10px] font-black uppercase tracking-tight">WhatsApp</span>
              </button>
              <button onClick={() => addNode('EMAIL')} className="p-3 hover:bg-blue-50 text-blue-600 rounded-xl flex items-center gap-3 transition-colors">
                  <Mail size={18} /> <span className="text-[10px] font-black uppercase tracking-tight">Email</span>
              </button>
              <button onClick={() => addNode('DELAY')} className="p-3 hover:bg-amber-50 text-amber-600 rounded-xl flex items-center gap-3 transition-colors">
                  <Clock size={18} /> <span className="text-[10px] font-black uppercase tracking-tight">Atraso</span>
              </button>
          </Panel>
        </ReactFlow>
      </div>

      <DelayPickerModal 
        isOpen={isDelayModalOpen}
        onClose={() => setIsDelayModalOpen(false)}
        initialHours={nodes.find(n => n.id === activeNodeId)?.data?.hours}
        onSave={(h) => setNodes((nds) => nds.map(n => n.id === activeNodeId ? { ...n, data: { ...n.data, hours: h, label: `Espera de ${h}h` } } : n))}
      />

      <MessagePickerModal 
        isOpen={isWAModalOpen}
        onClose={() => setIsWAModalOpen(false)}
        onSelect={(id, title, time) => setNodes((nds) => nds.map(n => n.id === activeNodeId ? { ...n, data: { ...n.data, waTemplateId: id, waTemplateTitle: title, sendTime: time, label: title } } : n))} 
        initialTemplateId={nodes.find(n => n.id === activeNodeId)?.data?.waTemplateId} 
        initialSendTime={nodes.find(n => n.id === activeNodeId)?.data?.sendTime}
      />
    </div>
  );
}

export default function FunnelEditor() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  );
}
