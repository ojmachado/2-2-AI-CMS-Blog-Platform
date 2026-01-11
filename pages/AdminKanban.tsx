import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { leadService } from '../services/leadService';
import { Lead, PipelineStage } from '../types';
import { Hash, Calendar, MessageSquare, GripVertical, Mail, RefreshCw, Edit2 } from 'lucide-react';
import { whatsappService } from '../services/whatsappService';
import { dbService } from '../services/dbService';
import { LeadDetailModal } from '../components/admin/LeadDetailModal';

// Column Configuration
const STAGES: { id: PipelineStage; label: string; color: string }[] = [
  { id: 'new', label: 'New Leads', color: 'bg-blue-50 border-blue-200' },
  { id: 'contacted', label: 'In Contact', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'qualified', label: 'Qualified', color: 'bg-indigo-50 border-indigo-200' },
  { id: 'converted', label: 'Converted', color: 'bg-green-50 border-green-200' },
  { id: 'lost', label: 'Lost', color: 'bg-slate-50 border-slate-200' }
];

export const AdminKanban: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Modal State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Load Leads
  const fetchLeads = async () => {
    try {
      const data = await leadService.getAllLeads();
      setLeads(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Helpers
  const getLeadsByStage = (stage: PipelineStage) => {
    return leads.filter(l => l.pipelineStage === stage);
  };

  const formatTime = (dateStr: string) => {
      const days = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24));
      if (days === 0) return 'Today';
      if (days === 1) return 'Yesterday';
      return `${days}d ago`;
  };

  // Drag End Handler
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStage = destination.droppableId as PipelineStage;
    
    // Optimistic Update
    const updatedLeads = leads.map(l => {
        if (l.id === draggableId) {
            return { ...l, pipelineStage: newStage };
        }
        return l;
    });
    setLeads(updatedLeads);

    // API Call
    try {
        setIsUpdating(true);
        await leadService.updateStage(draggableId, newStage);
    } catch (err) {
        console.error("Failed to update stage", err);
        // Revert on fail (re-fetch)
        fetchLeads(); 
    } finally {
        setIsUpdating(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center mb-6 px-1">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">CRM Pipeline</h1>
          <p className="text-slate-500 mt-1">Manage lead journey via Drag & Drop. Click on a card to edit or message.</p>
        </div>
        <button 
             onClick={fetchLeads}
             className="p-2 text-slate-500 hover:text-indigo-600 transition-colors"
             title="Refresh"
        >
            <RefreshCw size={20} className={loading || isUpdating ? 'animate-spin' : ''} />
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-1 gap-4 overflow-x-auto pb-4 items-stretch">
          {STAGES.map((stage) => (
            <div key={stage.id} className={`flex-shrink-0 w-80 flex flex-col rounded-xl border ${stage.color} bg-opacity-50`}>
              
              {/* Column Header */}
              <div className="p-4 flex items-center justify-between border-b border-white/50">
                  <span className="font-bold text-slate-700">{stage.label}</span>
                  <span className="bg-white/60 px-2 py-0.5 rounded text-xs font-semibold text-slate-600">
                      {getLeadsByStage(stage.id).length}
                  </span>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-3 overflow-y-auto space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-black/5' : ''}`}
                  >
                    {getLeadsByStage(stage.id).map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-4 rounded-lg shadow-sm border border-slate-200 group hover:shadow-md transition-all cursor-default ${snapshot.isDragging ? 'shadow-lg rotate-2 ring-2 ring-indigo-500 ring-opacity-50' : ''}`}
                            style={{ ...provided.draggableProps.style }}
                          >
                            <div className="flex justify-between items-start mb-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 truncate max-w-[120px]">
                                    {lead.source}
                                </span>
                                <GripVertical size={14} className="text-slate-300 cursor-grab" />
                            </div>
                            
                            <h4 className="font-semibold text-slate-800 text-sm truncate mb-1" title={lead.email}>
                                {lead.name || lead.email}
                            </h4>
                            {lead.name && <p className="text-xs text-slate-500 truncate mb-1">{lead.email}</p>}

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Calendar size={12} />
                                    {formatTime(lead.createdAt)}
                                </div>
                                <div className="flex gap-2">
                                    {lead.externalId && (
                                        <div className="text-blue-500" title="CAPI Synced">
                                            <Hash size={14} />
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => setSelectedLead(lead)}
                                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                                        title="Edit & Message"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                </div>
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

      {/* Detail Modal */}
      {selectedLead && (
        <LeadDetailModal 
            lead={selectedLead}
            isOpen={!!selectedLead}
            onClose={() => setSelectedLead(null)}
            onUpdate={() => {
                fetchLeads();
                // Optionally close modal or keep open, here we re-fetch to update background
            }}
        />
      )}
    </div>
  );
};