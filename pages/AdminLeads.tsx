import React, { useEffect, useState } from 'react';
import { leadService } from '../services/leadService';
import { Lead } from '../types';
import { Download, Users, Mail, Calendar, Hash, RefreshCw, Edit2 } from 'lucide-react';
import { LeadDetailModal } from '../components/admin/LeadDetailModal';

export const AdminLeads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
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

  const handleExportCSV = () => {
    if (leads.length === 0) return;

    // CSV Header
    // Note: 'email' (plain) and 'external_id' (hashed) are both useful. 
    // Hashed is for CAPI lookalikes, Plain is for Email Marketing tools.
    const headers = ['Name', 'Email', 'Phone', 'External ID (SHA256)', 'Source', 'Status', 'Stage', 'Created At'];
    
    const rows = leads.map(lead => [
      lead.name || '',
      lead.email,
      lead.phone || '',
      lead.externalId,
      lead.source,
      lead.status,
      lead.pipelineStage,
      new Date(lead.createdAt).toISOString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Lead Management (CRM)</h1>
          <p className="text-slate-500 mt-1">View and export captured leads for marketing campaigns.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={fetchLeads}
                className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg bg-white text-slate-700 hover:bg-slate-50"
            >
                <RefreshCw size={18} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
            </button>
            <button 
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
            <Download size={18} className="mr-2" />
            Export CSV
            </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">Total Leads</p>
                <p className="text-3xl font-bold text-slate-900">{leads.length}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                <Users size={24} />
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">This Month</p>
                <p className="text-3xl font-bold text-slate-900">
                    {leads.filter(l => new Date(l.createdAt) > new Date(new Date().setDate(1))).length}
                </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg text-green-600">
                <Calendar size={24} />
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">Active Subscribers</p>
                <p className="text-3xl font-bold text-slate-900">
                    {leads.filter(l => l.status === 'active').length}
                </p>
            </div>
             <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                <Mail size={24} />
            </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-slate-200">
        {loading ? (
            <div className="p-12 text-center text-slate-500">Loading leads...</div>
        ) : (
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CAPI ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stage</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{lead.name || 'Unnamed'}</div>
                        <div className="text-sm text-slate-500">{lead.email}</div>
                        {lead.phone && <div className="text-xs text-slate-400">{lead.phone}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-400" title={lead.externalId}>
                            <Hash size={12} />
                            <span className="text-xs font-mono max-w-[100px] truncate">{lead.externalId}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                            {lead.source}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${lead.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {lead.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 capitalize">
                            {lead.pipelineStage}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-500">
                        <button 
                            onClick={() => setSelectedLead(lead)}
                            className="text-slate-400 hover:text-indigo-600 transition-colors p-2"
                            title="Edit & Message"
                        >
                            <Edit2 size={16} />
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            {leads.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    No leads captured yet.
                </div>
            )}
            </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLead && (
        <LeadDetailModal 
            lead={selectedLead}
            isOpen={!!selectedLead}
            onClose={() => setSelectedLead(null)}
            onUpdate={() => {
                fetchLeads();
            }}
        />
      )}
    </div>
  );
};