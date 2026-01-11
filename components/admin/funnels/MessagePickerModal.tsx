
'use client';
import React, { useState, useEffect } from 'react';
import { whatsappService } from '../../../services/whatsappService';
import { WhatsAppMessageTemplate } from '../../../types';
import { X, Save, Plus, ArrowLeft, Clock } from 'lucide-react';

interface MessagePickerModalProps {
  isOpen: boolean;
  initialTemplateId?: string;
  initialSendTime?: string;
  onClose: () => void;
  onSelect: (templateId: string, templateTitle: string, sendTime?: string) => void;
}

export const MessagePickerModal = ({ 
  isOpen, 
  initialTemplateId, 
  initialSendTime,
  onClose, 
  onSelect 
}: MessagePickerModalProps) => {
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [templates, setTemplates] = useState<WhatsAppMessageTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendTime, setSendTime] = useState(initialSendTime || '');

  // Edit Mode State
  const [editingTemplate, setEditingTemplate] = useState<Partial<WhatsAppMessageTemplate>>({
      title: '',
      content: '',
      type: 'text'
  });

  useEffect(() => {
    if (isOpen) {
        loadTemplates();
        setSendTime(initialSendTime || '');
        setView('list');
    }
  }, [isOpen, initialSendTime]);

  const loadTemplates = async () => {
      setLoading(true);
      const list = await whatsappService.getInternalTemplates();
      setTemplates(list);
      setLoading(false);
  };

  const handleCreateNew = () => {
      setEditingTemplate({
          id: crypto.randomUUID(),
          title: '',
          content: '',
          type: 'text'
      });
      setView('edit');
  };

  const handleEdit = (tpl: WhatsAppMessageTemplate) => {
      setEditingTemplate(tpl);
      setView('edit');
  };

  const handleSaveTemplate = async () => {
      const { id, title, content } = editingTemplate;
      if (!id || !title || !content) return;
      
      await whatsappService.saveInternalTemplate({
          id,
          title,
          content,
          type: editingTemplate.type || 'text'
      });
      await loadTemplates();
      
      // Auto-select after saving
      if (id && title) {
          onSelect(id, title, sendTime);
      }
      onClose();
  };

  const handleSelectExisting = (tpl: WhatsAppMessageTemplate) => {
      onSelect(tpl.id, tpl.title, sendTime);
      onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                {view === 'edit' && (
                    <button onClick={() => setView('list')} className="mr-2 hover:bg-slate-200 p-1 rounded">
                        <ArrowLeft size={16} />
                    </button>
                )}
                {view === 'list' ? 'Configurar WhatsApp' : 'Editar Template'}
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
            </button>
        </div>

        {/* Timing Section (Always Visible in List View) */}
        {view === 'list' && (
            <div className="p-4 bg-indigo-50/50 border-b border-indigo-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-indigo-600" />
                        <span className="text-xs font-bold text-indigo-900 uppercase">Horário de Envio</span>
                    </div>
                    <input 
                        type="time"
                        value={sendTime}
                        onChange={(e) => setSendTime(e.target.value)}
                        className="rounded-lg border-indigo-200 text-sm focus:ring-indigo-500 py-1 px-2 shadow-sm"
                    />
                </div>
                <p className="text-[10px] text-indigo-400 mt-1">Se definido, a mensagem aguardará este horário para ser disparada.</p>
            </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
            {view === 'list' ? (
                <div className="space-y-2">
                    <button 
                        onClick={handleCreateNew}
                        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-indigo-200 rounded-lg text-indigo-600 font-medium hover:bg-indigo-50 transition-colors mb-4"
                    >
                        <Plus size={16} /> Criar Novo Template
                    </button>

                    {templates.length === 0 && (
                        <p className="text-center text-slate-400 text-sm py-4">Nenhum template encontrado.</p>
                    )}

                    {templates.map(tpl => (
                        <div key={tpl.id} className="group flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-indigo-300 transition-all bg-white">
                            <div 
                                className="flex-1 cursor-pointer" 
                                onClick={() => handleSelectExisting(tpl)}
                            >
                                <div className="font-medium text-slate-800 text-sm">{tpl.title}</div>
                                <div className="text-xs text-slate-500 truncate max-w-[250px]">{tpl.content}</div>
                            </div>
                            <button 
                                onClick={() => handleEdit(tpl)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-indigo-600"
                            >
                                Editar
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Título Interno</label>
                        <input 
                            type="text"
                            value={editingTemplate.title || ''}
                            onChange={e => setEditingTemplate({...editingTemplate, title: e.target.value})}
                            className="w-full border-slate-300 rounded-lg text-sm px-3 py-2"
                            placeholder="Ex: Mensagem de Boas Vindas"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Conteúdo da Mensagem</label>
                        <textarea 
                            rows={6}
                            value={editingTemplate.content || ''}
                            onChange={e => setEditingTemplate({...editingTemplate, content: e.target.value})}
                            className="w-full border-slate-300 rounded-lg text-sm px-3 py-2"
                            placeholder="Olá! Bem-vindo ao nosso portal..."
                        />
                        {/* Fix: Wrapped {{name}} in single curly braces to ensure it's treated as a string literal and not an object expression, preventing TS error regarding 'name' property. */}
                        <p className="text-[10px] text-slate-400 mt-1">Variáveis como {'{{name}}'} são suportadas.</p>
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        {view === 'edit' && (
            <div className="p-4 border-t border-slate-100 flex justify-end">
                <button 
                    onClick={handleSaveTemplate}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                    <Save size={16} /> Salvar e Selecionar
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
