
import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  addEdge, 
  useNodesState, 
  useEdgesState,
  BackgroundVariant,
  Panel,
  MarkerType,
  ReactFlowProvider
} from 'reactflow';
import type { Node, Edge, Connection } from 'reactflow';
import { funnelService } from '../services/funnelService';
import { Funnel, FunnelNode, FunnelNodeType } from '../types';
import EmailNode from '../components/admin/funnels/nodes/EmailNode';
import DelayNode from '../components/admin/funnels/nodes/DelayNode';
import WhatsAppNode from '../components/admin/funnels/nodes/WhatsAppNode';
import ConditionNode from '../components/admin/funnels/nodes/ConditionNode';
import ButtonEdge from '../components/admin/funnels/edges/ButtonEdge';
import { EmailPickerModal } from '../components/admin/funnels/EmailPickerModal';
import { MessagePickerModal } from '../components/admin/funnels/MessagePickerModal';
import { DelayPickerModal } from '../components/admin/funnels/DelayPickerModal';
import { ConditionPickerModal } from '../components/admin/funnels/ConditionPickerModal';
import { Plus, Save, ArrowLeft, MessageCircle, PlayCircle, Zap, Loader2, Edit3, Trash2, CheckCircle, Clock, Split, Mail } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const nodeTypes = {
  EMAIL: EmailNode,
  DELAY: DelayNode, 
  WHATSAPP: WhatsAppNode,
  CONDITION: ConditionNode,
};

const edgeTypes = {
  buttonEdge: ButtonEdge,
};

// Sub-componente para isolar a lógica do ReactFlow dentro do Provider
const FunnelCanvas = ({ funnel, onCancel, onSaveSuccess }: { funnel: Funnel, onCancel: () => void, onSaveSuccess: () => void }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isWAModalOpen, setIsWAModalOpen] = useState(false);
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [funnelName, setFunnelName] = useState(funnel.name);

  useEffect(() => {
    const flowNodes: Node[] = funnel.nodes.map(n => ({
      id: n.id,
      type: n.type,
      position: n.position || { x: 0, y: 0 },
      data: { 
        ...n.data, 
        onEdit: () => openEditModal(n.id, n.type) 
      }
    }));
    
    const flowEdges: Edge[] = [];
    funnel.nodes.forEach(n => {
      if (n.nextNodeId) flowEdges.push({ 
        id: `e${n.id}-${n.nextNodeId}`, 
        source: n.id, 
        target: n.nextNodeId,
        type: 'buttonEdge',
        markerEnd: { type: MarkerType.ArrowClosed }
      });
      if (n.trueNodeId) flowEdges.push({
        id: `e${n.id}-true-${n.trueNodeId}`,
        source: n.id,
        sourceHandle: 'true',
        target: n.trueNodeId,
        type: 'buttonEdge',
        markerEnd: { type: MarkerType.ArrowClosed }
      });
      if (n.falseNodeId) flowEdges.push({
        id: `e${n.id}-false-${n.falseNodeId}`,
        source: n.id,
        sourceHandle: 'false',
        target: n.falseNodeId,
        type: 'buttonEdge',
        markerEnd: { type: MarkerType.ArrowClosed }
      });
    });
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [funnel]);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({
    ...params,
    type: 'buttonEdge',
    markerEnd: { type: MarkerType.ArrowClosed }
  }, eds)), [setEdges]);

  const addNode = (type: FunnelNodeType) => {
    const id = uuidv4();
    const newNode: Node = {
      id, type, position: { x: 100, y: 100 },
      data: { 
        hours: type === 'DELAY' ? 24 : undefined,
        onEdit: () => openEditModal(id, type)
      }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const openEditModal = (nodeId: string, type: string) => {
    setActiveNodeId(nodeId);
    if (type === 'EMAIL') setIsEmailModalOpen(true);
    else if (type === 'WHATSAPP') setIsWAModalOpen(true);
    else if (type === 'DELAY') setIsDelayModalOpen(true);
    else if (type === 'CONDITION') setIsConditionModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const funnelNodes: FunnelNode[] = nodes.map(n => {
        const outgoingEdge = edges.find(e => e.source === n.id && !e.sourceHandle);
        const trueEdge = edges.find(e => e.source === n.id && e.sourceHandle === 'true');
        const falseEdge = edges.find(e => e.source === n.id && e.sourceHandle === 'false');
        const cleanData = { ...n.data };
        delete cleanData.onEdit;
        return {
          id: n.id,
          type: n.type as FunnelNodeType,
          position: n.position,
          data: cleanData,
          nextNodeId: outgoingEdge?.target || null,
          trueNodeId: trueEdge?.target || null,
          falseNodeId: falseEdge?.target || null
        };
      });
      const targetIds = new Set(edges.map(e => e.target));
      const startNode = funnelNodes.find(n => !targetIds.has(n.id)) || funnelNodes[0];
      await funnelService.saveFunnel({
        ...funnel,
        name: funnelName,
        nodes: funnelNodes,
        startNodeId: startNode?.id || ''
      });
      setSaveSuccess(true);
      setTimeout(() => onSaveSuccess(), 1000);
    } catch (e) {
      alert("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-slate-50 -mx-4 -mt-8 -mb-8 lg:-mx-8">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10 shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft size={20} /></button>
                <div>
                    <input 
                      value={funnelName}
                      onChange={(e) => setFunnelName(e.target.value)}
                      className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-600 outline-none text-xl px-1"
                    />
                    <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block uppercase tracking-wider">
                        Trigger: {funnel.trigger.replace(/_/g, ' ')}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
              {saveSuccess && <div className="text-green-600 text-sm font-bold flex items-center gap-1"><CheckCircle size={18}/> Salvo!</div>}
              <button onClick={handleSave} disabled={saving} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg disabled:opacity-50 flex items-center gap-2">
                  {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} Salvar Fluxo
              </button>
            </div>
        </div>
        <div className="flex-1 w-full relative">
            <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView>
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />
                <Controls />
                <Panel position="top-left" className="bg-white/95 backdrop-blur p-2 rounded-2xl shadow-xl border border-slate-200 flex flex-col gap-1 m-4">
                    <button onClick={() => addNode('WHATSAPP')} className="p-3 hover:bg-green-50 text-green-600 rounded-xl flex items-center gap-3 transition-colors group">
                        <MessageCircle size={18} /> <span className="text-xs font-bold uppercase">WhatsApp</span>
                    </button>
                    <button onClick={() => addNode('EMAIL')} className="p-3 hover:bg-blue-50 text-blue-600 rounded-xl flex items-center gap-3 transition-colors group">
                        <Mail size={18} /> <span className="text-xs font-bold uppercase">Email</span>
                    </button>
                    <button onClick={() => addNode('DELAY')} className="p-3 hover:bg-amber-50 text-amber-600 rounded-xl flex items-center gap-3 transition-colors group">
                        <Clock size={18} /> <span className="text-xs font-bold uppercase">Espera</span>
                    </button>
                    <button onClick={() => addNode('CONDITION')} className="p-3 hover:bg-purple-50 text-purple-600 rounded-xl flex items-center gap-3 transition-colors group">
                        <Split size={18} /> <span className="text-xs font-bold uppercase">Se/Senão</span>
                    </button>
                </Panel>
            </ReactFlow>
        </div>
        <EmailPickerModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} onSave={(s, c) => setNodes((nds) => nds.map(n => n.id === activeNodeId ? { ...n, data: { ...n.data, subject: s, content: c } } : n))} initialSubject={nodes.find(n => n.id === activeNodeId)?.data?.subject} initialContent={nodes.find(n => n.id === activeNodeId)?.data?.content} />
        <MessagePickerModal isOpen={isWAModalOpen} onClose={() => setIsWAModalOpen(false)} onSelect={(id, title, time) => setNodes((nds) => nds.map(n => n.id === activeNodeId ? { ...n, data: { ...n.data, waTemplateId: id, waTemplateTitle: title, sendTime: time, label: title } } : n))} initialTemplateId={nodes.find(n => n.id === activeNodeId)?.data?.waTemplateId} initialSendTime={nodes.find(n => n.id === activeNodeId)?.data?.sendTime} />
        <DelayPickerModal isOpen={isDelayModalOpen} onClose={() => setIsDelayModalOpen(false)} initialHours={nodes.find(n => n.id === activeNodeId)?.data?.hours} onSave={(h) => setNodes((nds) => nds.map(n => n.id === activeNodeId ? { ...n, data: { ...n.data, hours: h, label: `Esperar ${h}h` } } : n))} />
        <ConditionPickerModal isOpen={isConditionModalOpen} onClose={() => setIsConditionModalOpen(false)} initialTarget={nodes.find(n => n.id === activeNodeId)?.data?.conditionTarget} initialOperator={nodes.find(n => n.id === activeNodeId)?.data?.conditionOperator} initialValue={nodes.find(n => n.id === activeNodeId)?.data?.conditionValue} onSave={(t, o, v) => setNodes((nds) => nds.map(n => n.id === activeNodeId ? { ...n, data: { ...n.data, conditionTarget: t, conditionOperator: o, conditionValue: v, label: `Se ${t} ${o} ${v}` } } : n))} />
    </div>
  );
};

export const AdminFunnels: React.FC = () => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [editingFunnel, setEditingFunnel] = useState<Funnel | null>(null);

  useEffect(() => { loadFunnels(); }, []);

  const loadFunnels = async () => {
    setLoading(true);
    const data = await funnelService.getAllFunnels();
    setFunnels(data);
    setLoading(false);
  };

  const handleCreateDefaultFunnel = async () => {
      const postUpdateFunnel = funnels.find(f => f.trigger === 'new_post_published');
      if (postUpdateFunnel) { setEditingFunnel(postUpdateFunnel); return; }
      setIsInitializing(true);
      try {
          const funnel = await funnelService.createDefaultPostUpdateFunnel();
          await loadFunnels();
          setEditingFunnel(funnel);
      } finally { setIsInitializing(false); }
  };

  const handleDeleteFunnel = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Excluir este funil?')) return;
    await funnelService.deleteFunnel(id);
    loadFunnels();
  };

  if (editingFunnel) {
    return (
      <ReactFlowProvider>
        <FunnelCanvas 
          funnel={editingFunnel} 
          onCancel={() => setEditingFunnel(null)} 
          onSaveSuccess={() => { setEditingFunnel(null); loadFunnels(); }} 
        />
      </ReactFlowProvider>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Funis de Automação</h1>
                <p className="text-slate-500 mt-2 text-lg">Gerencie a jornada automática dos seus leitores.</p>
            </div>
            <button onClick={() => setEditingFunnel({ id: uuidv4(), name: 'Novo Funil', trigger: 'lead_subscribed', isActive: true, nodes: [], startNodeId: '' })} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-xl transition-all"><Plus size={20} /> Novo Funil</button>
        </div>

        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center gap-10 overflow-hidden relative shadow-2xl border border-white/5">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Zap size={350} /></div>
            <div className="flex-1 relative z-10">
                <h3 className="text-4xl font-black mb-4 tracking-tight">Distribuição de Novos Posts</h3>
                <p className="text-indigo-100 mb-10 text-lg max-w-xl leading-relaxed opacity-90">Ative o fluxo que notifica automaticamente seus inscritos toda vez que um novo artigo for publicado.</p>
            </div>
            <button onClick={handleCreateDefaultFunnel} disabled={isInitializing} className="whitespace-nowrap bg-white text-indigo-950 px-10 py-5 rounded-[1.5rem] font-black hover:bg-indigo-50 transition-all shadow-2xl flex items-center gap-3 transform hover:scale-105 active:scale-95 text-lg">
                {isInitializing ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} />} {funnels.some(f => f.trigger === 'new_post_published') ? 'Editar Automação' : 'Configurar Agora'}
            </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {funnels.filter(f => f.trigger !== 'new_post_published').map(funnel => (
                <div key={funnel.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:border-indigo-300 transition-all cursor-pointer group flex flex-col h-full hover:shadow-2xl relative overflow-hidden" onClick={() => setEditingFunnel(funnel)}>
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="font-bold text-slate-900 text-xl pr-10">{funnel.name}</h3>
                        <div className={`w-3 h-3 rounded-full ${funnel.isActive ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                    </div>
                    <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-6">
                        <span className="text-indigo-600 text-sm font-black uppercase tracking-widest">Personalizar</span>
                        <button onClick={(e) => handleDeleteFunnel(funnel.id, e)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
