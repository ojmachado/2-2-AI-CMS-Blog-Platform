
import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import { Trash2, User as UserIcon, Shield, AlertTriangle, Calendar, Clock, Plus, X, UserPlus, Check } from 'lucide-react';

const SUPER_ADMIN_EMAIL = 'ojmachadomkt@gmail.com';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'editor'>('editor');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await authService.getAllUsers();
      // Sort: Super Admin first, then by createdAt desc
      const sorted = data.sort((a, b) => {
          if (a.email.toLowerCase() === SUPER_ADMIN_EMAIL) return -1;
          if (b.email.toLowerCase() === SUPER_ADMIN_EMAIL) return 1;
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      });
      setUsers(sorted);
    } catch (err) {
      setError('Falha ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
        await authService.addUser(newEmail, newRole);
        setSuccess(`Usuário ${newEmail} adicionado com sucesso.`);
        setIsModalOpen(false);
        setNewEmail('');
        setNewRole('editor');
        fetchUsers();
    } catch (err: any) {
        setError(err.message || 'Erro ao adicionar usuário.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async (email: string) => {
    if (!window.confirm(`Tem certeza que deseja remover o usuário ${email}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setSuccess(null);
    setError(null);

    try {
      await authService.deleteUser(email);
      setSuccess(`Usuário ${email} removido com sucesso.`);
      fetchUsers(); // Refresh list
    } catch (err: any) {
      setError(err.message || 'Falha ao deletar usuário.');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('pt-BR') + ' ' + new Date(dateStr).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Equipe</h1>
          <p className="text-slate-500 mt-1">Gerencie os administradores e editores da sua plataforma.</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
        >
            <Plus size={18} /> Novo Usuário
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle size={20} className="shrink-0" />
            <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <Check size={20} className="shrink-0" />
            <span className="text-sm font-semibold">{success}</span>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-[2.5rem] overflow-hidden border border-slate-200">
        {loading ? (
            <div className="p-20 text-center text-slate-500 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="font-bold">Carregando lista de acesso...</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Usuário</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Permissão</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data de Criação</th>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Último Acesso</th>
                            <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {users.map((user) => {
                            const isSuperAdmin = user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
                            return (
                                <tr key={user.email} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className={`flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${isSuperAdmin ? 'bg-indigo-100 text-indigo-600 shadow-inner' : 'bg-slate-100 text-slate-500 group-hover:bg-white'}`}>
                                                {isSuperAdmin ? <Shield size={22} /> : <UserIcon size={22} />}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-black text-slate-900">{user.email}</div>
                                                {isSuperAdmin && (
                                                    <span className="text-[9px] text-indigo-600 font-black uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 inline-block mt-1">
                                                        Master Account
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-[10px] font-black uppercase tracking-widest leading-5 rounded-full border ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-500 font-medium">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-300" />
                                            {formatDate(user.createdAt)}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-500 font-medium">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-slate-300" />
                                            {formatDate(user.lastSignInTime)}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                                        {isSuperAdmin ? (
                                            <span className="text-slate-200 cursor-not-allowed flex justify-end" title="Super Admin não pode ser removido">
                                                <Trash2 size={20} />
                                            </span>
                                        ) : (
                                            <button 
                                                onClick={() => handleDelete(user.email)}
                                                className="text-slate-300 hover:text-red-600 transition-all p-2 hover:bg-red-50 rounded-xl"
                                                title="Deletar Usuário"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                            <UserPlus size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Adicionar Membro</h2>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Convidar para a plataforma</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleAddUser} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">E-mail de Acesso</label>
                        <input 
                            type="email"
                            required
                            value={newEmail}
                            onChange={e => setNewEmail(e.target.value)}
                            placeholder="exemplo@dominio.com"
                            className="w-full rounded-2xl border-slate-200 py-4 px-4 text-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all shadow-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nível de Permissão</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setNewRole('editor')}
                                className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-1 ${newRole === 'editor' ? 'border-indigo-600 bg-indigo-50 shadow-inner' : 'border-slate-100 hover:border-slate-200'}`}
                            >
                                <span className={`text-xs font-black uppercase tracking-widest ${newRole === 'editor' ? 'text-indigo-600' : 'text-slate-400'}`}>Editor</span>
                                <span className="text-[10px] text-slate-500 font-medium leading-tight">Pode criar e editar posts, mas não altera as configurações.</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setNewRole('admin')}
                                className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-1 ${newRole === 'admin' ? 'border-indigo-600 bg-indigo-50 shadow-inner' : 'border-slate-100 hover:border-slate-200'}`}
                            >
                                <span className={`text-xs font-black uppercase tracking-widest ${newRole === 'admin' ? 'text-indigo-600' : 'text-slate-400'}`}>Admin</span>
                                <span className="text-[10px] text-slate-500 font-medium leading-tight">Acesso total ao sistema, incluindo CRM e Integrações.</span>
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 space-y-4">
                        <button
                            type="submit"
                            disabled={isSubmitting || !newEmail}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>Salvar e Autorizar <Plus size={18} /></>
                            )}
                        </button>
                        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                            O usuário poderá acessar o sistema imediatamente informando seu e-mail na tela de login e criando uma senha no primeiro acesso.
                        </p>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
