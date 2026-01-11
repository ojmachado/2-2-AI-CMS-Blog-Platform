
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { leadService } from '../services/leadService';
import { emailService } from '../services/emailService';
import { Lead } from '../types';
import { Mail, Send, CheckCircle, AlertTriangle, Users, Plus, Layout } from 'lucide-react';

export const AdminEmail: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await leadService.getAllLeads();
        setLeads(data);
        if (data.length > 0) setSelectedLeadId(data[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedLeadId || !subject || !message) return;

      const lead = leads.find(l => l.id === selectedLeadId);
      if (!lead) return;

      setStatus('sending');
      setFeedback('');

      try {
          const result = await emailService.sendManualNotification(lead.email, subject, message);
          if (result.success) {
              setStatus('success');
              setFeedback(result.simulated ? 'Email simulated successfully (check console).' : 'Email sent via Resend!');
              setMessage('');
              setSubject('');
          } else {
              throw new Error(result.error || 'Unknown error');
          }
      } catch (err: any) {
          setStatus('error');
          setFeedback(err.message || 'Failed to send email.');
      }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading leads...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Email Marketing</h1>
          <p className="text-slate-500 mt-1">Gerencie disparos manuais e modelos visuais.</p>
        </div>
        <Link 
            to="/admin/emails/editor" 
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-2 transition-all"
        >
            <Plus size={20} /> Novo Template Visual
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick Stats / History Placeholder */}
          <div className="md:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <Layout size={18} className="text-indigo-600" /> Templates Recentes
                  </h3>
                  <div className="space-y-2">
                      <p className="text-xs text-slate-400 italic text-center py-4 border border-dashed rounded-xl">Seus templates do Unlayer aparecerão aqui.</p>
                  </div>
              </div>
          </div>

          {/* Send Form */}
          <div className="md:col-span-2 bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Send size={20} className="text-indigo-600" /> Disparo Rápido
            </h3>
            
            {status === 'success' && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-2xl flex items-center gap-2 border border-green-100">
                    <CheckCircle size={20} /> {feedback}
                </div>
            )}
            {status === 'error' && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-2 border border-red-100">
                    <AlertTriangle size={20} /> {feedback}
                </div>
            )}

            <form onSubmit={handleSend} className="space-y-6">
                <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Destinatário</label>
                    <div className="relative">
                        <Users size={18} className="absolute top-3.5 left-4 text-slate-400" />
                        <select
                            value={selectedLeadId}
                            onChange={(e) => setSelectedLeadId(e.target.value)}
                            className="block w-full pl-12 rounded-2xl border-slate-200 shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 py-3 px-3 border transition-all text-sm"
                        >
                            {leads.map(lead => (
                                <option key={lead.id} value={lead.id}>
                                    {lead.email} {lead.name ? `(${lead.name})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Assunto do E-mail</label>
                    <input 
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        placeholder="Ex: Novidades quentes sobre IA para você"
                        className="block w-full rounded-2xl border-slate-200 shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 py-3 px-4 border transition-all text-sm"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Mensagem (Texto Puro)</label>
                    <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={6}
                        placeholder="Digite sua mensagem personalizada..."
                        className="block w-full rounded-2xl border-slate-200 shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 py-3 px-4 border transition-all text-sm resize-none"
                    />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={status === 'sending'}
                        className="w-full inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-black rounded-2xl shadow-xl shadow-indigo-100 text-white bg-slate-900 hover:bg-slate-800 focus:outline-none transition-all disabled:opacity-50"
                    >
                        {status === 'sending' ? 'Processando envio...' : (
                            <>
                                <Send size={18} className="mr-2" /> Disparar Agora
                            </>
                        )}
                    </button>
                </div>
            </form>
          </div>
      </div>
    </div>
  );
};
