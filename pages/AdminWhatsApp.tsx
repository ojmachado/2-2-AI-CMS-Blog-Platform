import React, { useEffect, useState } from 'react';
import { leadService } from '../services/leadService';
import { whatsappService } from '../services/whatsappService';
import { Lead, WhatsAppTemplate } from '../types';
import { Send, Users, MessageSquare, AlertTriangle, CheckCircle, RefreshCw, Smartphone } from 'lucide-react';

export const AdminWhatsApp: React.FC = () => {
  // Data State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);

  // Selection State
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Message Config State
  const [selectedTemplate, setSelectedTemplate] = useState<string>('hello_world');
  const [templateVariables, setTemplateVariables] = useState<string[]>([]);
  const [fallbackText, setFallbackText] = useState('');
  
  // Sending State
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [sendResult, setSendResult] = useState<{ success: number, total: number } | null>(null);

  useEffect(() => {
    loadData();
    setTemplates(whatsappService.getTemplates());
  }, []);

  const loadData = async () => {
    setLoadingLeads(true);
    try {
      const allLeads = await leadService.getAllLeads();
      // Only leads with phone numbers
      setLeads(allLeads.filter(l => !!l.phone));
    } finally {
      setLoadingLeads(false);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(l => l.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectLead = (id: string) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter(l => l !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tplName = e.target.value;
    setSelectedTemplate(tplName);
    const tpl = templates.find(t => t.name === tplName);
    if (tpl) {
        setTemplateVariables(new Array(tpl.variables.length).fill(''));
        setFallbackText(tpl.previewText); // Default fallback to preview text
    }
  };

  const handleVariableChange = (index: number, value: string) => {
    const newVars = [...templateVariables];
    newVars[index] = value;
    setTemplateVariables(newVars);
    
    // Auto-update fallback text roughly
    const tpl = templates.find(t => t.name === selectedTemplate);
    if (tpl) {
        let text = tpl.previewText;
        newVars.forEach((v, i) => {
            if (v) text = text.replace(`{{${i+1}}}`, v);
        });
        setFallbackText(text);
    }
  };

  const handleSend = async () => {
    if (selectedLeads.length === 0) return;
    if (!confirm(`Are you sure you want to send this message to ${selectedLeads.length} leads?`)) return;

    setIsSending(true);
    setSendResult(null);
    setProgress({ current: 0, total: selectedLeads.length });

    // Get phone numbers
    const recipients = leads
        .filter(l => selectedLeads.includes(l.id))
        .map(l => l.phone!);

    try {
        const successCount = await whatsappService.sendBulkMessage(
            recipients,
            selectedTemplate,
            templateVariables,
            fallbackText,
            (curr, total) => setProgress({ current: curr, total })
        );
        setSendResult({ success: successCount, total: recipients.length });
        setSelectedLeads([]);
        setSelectAll(false);
    } catch (error) {
        console.error(error);
        alert("Fatal error during bulk send.");
    } finally {
        setIsSending(false);
    }
  };

  const activeTemplate = templates.find(t => t.name === selectedTemplate);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">WhatsApp Marketing</h1>
        <p className="text-slate-500 mt-1">Send campaigns using Meta Cloud API with Evolution fallback.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Audience Selection */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
             <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                 <Users size={18} /> Audience ({selectedLeads.length})
             </h3>
             <button onClick={loadData} className="text-slate-400 hover:text-indigo-600">
                 <RefreshCw size={16} />
             </button>
          </div>
          
          <div className="p-2 border-b border-slate-200 bg-slate-50">
             <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer p-2 hover:bg-slate-100 rounded">
                 <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                 />
                 <span className="font-medium">Select All ({leads.length})</span>
             </label>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
             {loadingLeads ? (
                 <div className="text-center py-10 text-slate-400">Loading leads...</div>
             ) : (
                 leads.map(lead => (
                     <label key={lead.id} className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors border ${selectedLeads.includes(lead.id) ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-slate-50 border-transparent'}`}>
                         <input 
                            type="checkbox"
                            checked={selectedLeads.includes(lead.id)}
                            onChange={() => handleSelectLead(lead.id)}
                            className="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
                         />
                         <div className="flex-1 min-w-0">
                             <p className="text-sm font-medium text-slate-900 truncate">{lead.email}</p>
                             <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                 <Smartphone size={12} /> {lead.phone}
                                 <span className="bg-slate-100 px-1.5 rounded">{lead.source}</span>
                             </div>
                         </div>
                     </label>
                 ))
             )}
             {leads.length === 0 && !loadingLeads && (
                 <div className="p-4 text-center text-slate-500 text-sm">
                     No leads with phone numbers found.
                 </div>
             )}
          </div>
        </div>

        {/* Middle Column: Message Config */}
        <div className="lg:col-span-1 space-y-6">
            
            {/* Template Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                 <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                     <MessageSquare size={18} /> Message Configuration
                 </h3>
                 
                 <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Select Template (Meta)</label>
                     <select 
                        value={selectedTemplate}
                        onChange={handleTemplateChange}
                        className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                     >
                         {templates.map(t => (
                             <option key={t.name} value={t.name}>{t.label} ({t.category})</option>
                         ))}
                     </select>
                     <p className="text-xs text-slate-500 mt-1">Templates must be pre-approved by Meta.</p>
                 </div>

                 {/* Variables */}
                 {activeTemplate && activeTemplate.variables.length > 0 && (
                     <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                         <span className="text-xs font-semibold text-slate-500 uppercase">Variables</span>
                         {activeTemplate.variables.map((v, idx) => (
                             <div key={idx}>
                                 <label className="block text-xs font-medium text-slate-700 mb-1">Variable {v}</label>
                                 <input 
                                    type="text"
                                    value={templateVariables[idx] || ''}
                                    onChange={(e) => handleVariableChange(idx, e.target.value)}
                                    placeholder={`Value for ${v}`}
                                    className="block w-full rounded border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                 />
                             </div>
                         ))}
                     </div>
                 )}
            </div>

            {/* Fallback Text */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                        <AlertTriangle size={16} className="text-orange-500" /> Fallback Text (Evolution)
                    </h3>
                 </div>
                 <p className="text-xs text-slate-500">
                     This text will be sent via the unofficial API if the Meta template fails or if you want to send free text.
                 </p>
                 <textarea 
                    value={fallbackText}
                    onChange={(e) => setFallbackText(e.target.value)}
                    rows={6}
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    placeholder="Enter your fallback message here..."
                 />
            </div>
        </div>

        {/* Right Column: Preview & Action */}
        <div className="lg:col-span-1 space-y-6">
            
            {/* Phone Preview */}
            <div className="bg-slate-900 rounded-[2rem] p-4 shadow-xl border-4 border-slate-800 relative max-w-xs mx-auto">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl"></div>
                
                {/* Screen */}
                <div className="bg-[#e5ddd5] rounded-xl h-[400px] overflow-hidden flex flex-col relative">
                    {/* Header */}
                    <div className="bg-[#075e54] h-12 flex items-center px-4">
                        <div className="w-8 h-8 rounded-full bg-white/20"></div>
                        <div className="ml-2">
                             <div className="w-20 h-2 bg-white/40 rounded"></div>
                        </div>
                    </div>
                    
                    {/* Message Body */}
                    <div className="p-4 flex-1">
                        <div className="bg-white p-2 rounded-lg shadow-sm rounded-tl-none max-w-[85%] mb-2">
                            <p className="text-xs text-slate-800 whitespace-pre-wrap">
                                {fallbackText || "Preview..."}
                            </p>
                            <div className="text-[9px] text-slate-400 text-right mt-1">12:00 PM</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Send Button */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
                 {isSending ? (
                     <div className="space-y-3">
                         <RefreshCw className="animate-spin mx-auto text-indigo-600" size={32} />
                         <p className="font-medium text-slate-900">Sending Broadcast...</p>
                         <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div 
                                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                                style={{ width: `${(progress.current / progress.total) * 100}%` }}
                            ></div>
                         </div>
                         <p className="text-sm text-slate-500">{progress.current} of {progress.total}</p>
                     </div>
                 ) : sendResult ? (
                     <div className="space-y-3">
                         <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                             <CheckCircle size={24} />
                         </div>
                         <h3 className="font-bold text-slate-900">Campaign Finished</h3>
                         <p className="text-sm text-slate-600">
                             Successfully sent to {sendResult.success} of {sendResult.total} leads.
                         </p>
                         <button 
                            onClick={() => setSendResult(null)}
                            className="text-indigo-600 hover:underline text-sm font-medium"
                         >
                             Start New Campaign
                         </button>
                     </div>
                 ) : (
                    <>
                        <p className="text-sm text-slate-500 mb-4">
                            Selected: <span className="font-bold text-slate-900">{selectedLeads.length} leads</span>
                        </p>
                        <button
                            onClick={handleSend}
                            disabled={selectedLeads.length === 0}
                            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Send size={20} className="mr-2" />
                            Send Campaign
                        </button>
                    </>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};