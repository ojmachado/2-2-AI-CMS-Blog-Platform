import React, { useState, useEffect } from 'react';
import { Lead, WhatsAppTemplate, PipelineStage } from '../../types';
import { leadService } from '../../services/leadService';
import { whatsappService } from '../../services/whatsappService';
import { X, Save, MessageSquare, User, Smartphone, FileText, Send, AlertTriangle } from 'lucide-react';

interface LeadDetailModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void; // Trigger refresh in parent
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, isOpen, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'whatsapp'>('details');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // Form State - Details
  const [formData, setFormData] = useState({
    name: lead.name || '',
    phone: lead.phone || '',
    notes: lead.notes || '',
    pipelineStage: lead.pipelineStage
  });

  // Form State - WhatsApp
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [mode, setMode] = useState<'template' | 'free_text'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState('hello_world');
  const [variables, setVariables] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');

  useEffect(() => {
    if (isOpen) {
        setFormData({
            name: lead.name || '',
            phone: lead.phone || '',
            notes: lead.notes || '',
            pipelineStage: lead.pipelineStage
        });
        setTemplates(whatsappService.getTemplates());
        setNotification(null);
        setActiveTab('details');
    }
  }, [isOpen, lead]);

  const handleSaveDetails = async () => {
    setLoading(true);
    setNotification(null);
    try {
        await leadService.updateLead(lead.id, formData);
        setNotification({ type: 'success', msg: 'Lead updated successfully.' });
        onUpdate();
    } catch (error) {
        setNotification({ type: 'error', msg: 'Failed to update lead.' });
    } finally {
        setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    // Note: If using the modal, we assume the user might have just updated the phone number in the 'Details' tab.
    // However, the 'lead' prop is stale until onUpdate triggers a re-fetch in parent. 
    // We should use formData.phone for the message target to be safe.
    const targetPhone = formData.phone;

    if (!targetPhone) {
        setNotification({ type: 'error', msg: 'Please add a phone number in the Details tab first.' });
        return;
    }

    setLoading(true);
    try {
        if (mode === 'template') {
            await whatsappService.sendHybridMessage({
                to: targetPhone,
                templateName: selectedTemplate,
                variables: variables,
                fallbackText: "Template fallback message sent via Evolution." // Generic fallback
            });
        } else {
             // Hack: To send free text, we intentionally use a non-existent template name
             // so the service fails Meta and falls back to Evolution with our custom text.
             if(!freeText.trim()) throw new Error("Message cannot be empty");
             
             await whatsappService.sendHybridMessage({
                 to: targetPhone,
                 templateName: 'FORCE_FALLBACK_MODE', 
                 variables: [],
                 fallbackText: freeText
             });
        }
        setNotification({ type: 'success', msg: 'Message queued/sent.' });
        setFreeText('');
    } catch (error) {
        console.error(error);
        setNotification({ type: 'error', msg: 'Failed to send message.' });
    } finally {
        setLoading(false);
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedTemplate(e.target.value);
      const tpl = templates.find(t => t.name === e.target.value);
      if(tpl) setVariables(new Array(tpl.variables.length).fill(''));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <User size={20} className="text-indigo-600"/> 
                    {lead.email}
                </h2>
                <p className="text-xs text-slate-500 mt-1">ID: {lead.id}</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
            <button 
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors border-b-2 ${activeTab === 'details' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <FileText size={16} /> Lead Details
            </button>
            <button 
                onClick={() => setActiveTab('whatsapp')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors border-b-2 ${activeTab === 'whatsapp' ? 'border-green-600 text-green-600 bg-green-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <MessageSquare size={16} /> WhatsApp
            </button>
        </div>

        {/* Notification Area */}
        {notification && (
            <div className={`mx-6 mt-4 p-3 rounded-md text-sm flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {notification.type === 'error' && <AlertTriangle size={16} />} 
                {notification.msg}
            </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto">
            
            {/* --- DETAILS TAB --- */}
            {activeTab === 'details' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Name</label>
                            <input 
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="John Doe"
                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Phone (WhatsApp)</label>
                            <div className="relative">
                                <Smartphone size={14} className="absolute top-3 left-3 text-slate-400" />
                                <input 
                                    type="text"
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                    placeholder="5511999999999"
                                    className="block w-full pl-9 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 border"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Pipeline Stage</label>
                        <select
                            value={formData.pipelineStage}
                            onChange={e => setFormData({...formData, pipelineStage: e.target.value as PipelineStage})}
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                        >
                            <option value="new">New Lead</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="converted">Converted</option>
                            <option value="lost">Lost</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Internal Notes</label>
                        <textarea 
                            rows={4}
                            value={formData.notes}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                            placeholder="Add notes about conversations or interests..."
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            onClick={handleSaveDetails}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            <Save size={16} className="mr-2" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )}

            {/* --- WHATSAPP TAB --- */}
            {activeTab === 'whatsapp' && (
                <div className="space-y-4">
                    {!formData.phone && (
                        <div className="p-3 bg-orange-100 text-orange-800 rounded-md text-xs mb-4">
                            ⚠️ Please save a phone number in the Details tab first.
                        </div>
                    )}

                    <div className="flex items-center space-x-4 mb-4">
                        <label className="inline-flex items-center">
                            <input 
                                type="radio" 
                                className="form-radio text-green-600" 
                                name="mode" 
                                value="template"
                                checked={mode === 'template'}
                                onChange={() => setMode('template')} 
                            />
                            <span className="ml-2 text-sm text-slate-700">Meta Template (Official)</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input 
                                type="radio" 
                                className="form-radio text-green-600" 
                                name="mode" 
                                value="free_text"
                                checked={mode === 'free_text'}
                                onChange={() => setMode('free_text')} 
                            />
                            <span className="ml-2 text-sm text-slate-700">Free Text (Evolution)</span>
                        </label>
                    </div>

                    {mode === 'template' ? (
                        <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                             <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Select Template</label>
                                <select 
                                    value={selectedTemplate}
                                    onChange={handleTemplateChange}
                                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm border py-2 px-3"
                                >
                                    {templates.map(t => (
                                        <option key={t.name} value={t.name}>{t.label}</option>
                                    ))}
                                </select>
                             </div>
                             {variables.length > 0 && (
                                 <div className="space-y-2">
                                     <span className="text-xs font-semibold text-slate-500 uppercase">Variables</span>
                                     {variables.map((v, i) => (
                                         <input 
                                            key={i}
                                            type="text"
                                            placeholder={`{{${i+1}}}`}
                                            value={v}
                                            onChange={e => {
                                                const newVars = [...variables];
                                                newVars[i] = e.target.value;
                                                setVariables(newVars);
                                            }}
                                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm border py-2 px-3"
                                         />
                                     ))}
                                 </div>
                             )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                             <div className="bg-orange-50 p-3 rounded border border-orange-100 text-xs text-orange-800">
                                 Note: Free text sending requires Evolution API configuration. Meta API only supports templates for initial contact.
                             </div>
                             <textarea 
                                rows={5}
                                value={freeText}
                                onChange={e => setFreeText(e.target.value)}
                                placeholder="Type your message here..."
                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm border py-2 px-3"
                             />
                        </div>
                    )}

                    <div className="pt-4 flex justify-end">
                        <button
                            onClick={handleSendMessage}
                            disabled={loading || !formData.phone}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            <Send size={16} className="mr-2" />
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};