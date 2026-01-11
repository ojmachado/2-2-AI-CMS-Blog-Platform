'use client';
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { User, Phone, MoreHorizontal } from 'lucide-react';

// Tipagem simplificada
type Lead = { id: string; name: string; status: string; email: string };

const COLUMNS = {
  new: { title: 'Novos', color: 'bg-blue-100' },
  contacted: { title: 'Em Contato', color: 'bg-yellow-100' },
  qualified: { title: 'Qualificados', color: 'bg-purple-100' },
  converted: { title: 'Convertidos', color: 'bg-green-100' },
  lost: { title: 'Perdidos', color: 'bg-gray-100' },
};

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [winReady, setWinReady] = useState(false);

  // Hack para evitar erro de hidratação com DnD
  useEffect(() => {
    setWinReady(true);
    // Mock Data (substituir por fetch do Firestore)
    setLeads([
      { id: '1', name: 'João Silva', email: 'joao@gmail.com', status: 'new' },
      { id: '2', name: 'Maria Souza', email: 'maria@hotmail.com', status: 'contacted' },
    ]);
  }, []);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    // Atualização Otimista
    setLeads((prev) =>
      prev.map((l) => (l.id === draggableId ? { ...l, status: newStatus } : l))
    );

    // TODO: Chamar API para atualizar Firestore
    console.log(`Lead ${draggableId} movido para ${newStatus}`);
  };

  if (!winReady) return <div>Carregando CRM...</div>;

  return (
    <div className="p-6 h-screen bg-slate-50 overflow-x-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Pipeline de Vendas</h1>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 min-w-max">
          {Object.entries(COLUMNS).map(([columnId, col]) => (
            <div key={columnId} className="w-80 flex flex-col">
              <div className={`p-3 rounded-t-lg font-bold flex justify-between ${col.color}`}>
                <span>{col.title}</span>
                <span className="bg-white/50 px-2 rounded text-sm">
                  {leads.filter(l => l.status === columnId).length}
                </span>
              </div>
              
              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="bg-slate-100/50 p-2 min-h-[500px] rounded-b-lg border border-t-0 border-slate-200"
                  >
                    {leads
                      .filter((lead) => lead.status === columnId)
                      .map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-4 mb-3 rounded shadow-sm hover:shadow-md transition-shadow border border-slate-200 cursor-grab active:cursor-grabbing"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-slate-800">{lead.name}</h3>
                                <button className="text-slate-400 hover:text-indigo-600">
                                  <MoreHorizontal size={16} />
                                </button>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <User size={12} /> {lead.email}
                              </div>
                              <div className="flex justify-end mt-3">
                                <button className="text-green-600 bg-green-50 p-1 rounded hover:bg-green-100">
                                  <Phone size={14} />
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}