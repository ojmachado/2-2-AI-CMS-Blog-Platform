
import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import { 
  Trash2, 
  User as UserIcon, 
  Shield, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Plus, 
  X, 
  UserPlus, 
  CheckCircle,
  MoreVertical,
  Mail
} from 'lucide-react';

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
        setSuccess(`Usuário ${newEmail} autorizado com sucesso.`);
        setIsModalOpen(false);
        setNewEmail('');
        setNewRole('editor');
        fetchUsers();
    } catch (err: any) {
        setError(err.message || 'Erro ao autorizar usuário.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async (email: string) => {
    if (email.toLowerCase() === SUPER_ADMIN_EMAIL) {
        alert("A conta Master não pode ser removida.");
        return;
    }

    if (!window.confirm(`Tem certeza que deseja revogar o acesso de ${email}?`)) {
      return;
    }

    setSuccess(null);
    setError(null);

    try {
      await authService.deleteUser(email);
      setSuccess(`Acesso de ${email} removido com sucesso.`);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Falha ao deletar usuário.');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Nunca acessou';
    return new Date(dateStr).toLocaleDateString('pt-BR') + ' ' + new Date(dateStr).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Equipe Editorial</h1>
          <p className="text-slate-500 mt-1">Gerencie quem pode criar conteúdos e administrar a plataforma.</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
        >
            <UserPlus size={20} /> Convidar Membro
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle size={20} className="shrink-0" />
            <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle size={20} className="shrink-0" />
            <span className="text-sm font-bold">{success}</span>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-[2.5rem] overflow-hidden border border-slate-200">
        {loading ? (
            <div className="p-20 text-center text-slate-500 flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="font-black uppercase tracking-widest text-xs">Sincronizando permissões...</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Usuário</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nível</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data de Cadastro</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Última Atividade</th>
                            <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {users.map((user) => {
                            const isSuperAdmin = user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
                            return (
                                <tr key={user.email} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className={`flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${isSuperAdmin ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:shadow-md'}`}>
                                                {isSuperAdmin ? <Shield size={22} /> : <UserIcon size={22} />}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-black text-slate-900">{user.email}</div>
                                                {isSuperAdmin && (
                                                    <span className="text-[9px] text-indigo-600 font-black uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 inline-block mt-1">
                                                        Sistema Master
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className={`px-4 py-1 inline-flex text-[10px] font-black uppercase tracking-widest leading-5 rounded-full border ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-xs text-slate-500 font-bold">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-300" />
                                            {formatDate(user.createdAt).split(' ')[0]}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-xs text-slate-500 font-bold">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-slate-300" />
                                            {formatDate(user.lastSignInTime)}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                                        {isSuperAdmin ? (
                                            <div className="flex justify-end pr-2 text-slate-200 cursor-not-allowed">
                                                <Shield size={20} />
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => handleDelete(user.email)}
                                                className="text-slate-300 hover:text-red-600 transition-all p-3 hover:bg-red-50 rounded-2xl active:scale-90"
                                                title="Revogar Acesso"
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

      {/* Modal de Convite */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100">
                            <UserPlus size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Novo Acesso</h2>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2">Liberar permissões no painel</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="p-3 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleAddUser} className="p-10 space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                            <Mail size={12} /> E-mail Institucional
                        </label>
                        <input 
                            type="email"
                            required
                            value={newEmail}
                            onChange={e => setNewEmail(e.target.value)}
                            placeholder="colaborador@seu-blog.com"
                            className="w-full rounded-2xl border-slate-200 py-4.5 px-6 text-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all shadow-inner bg-slate-50/50"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nível de Acesso</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setNewRole('editor')}
                                className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-2 ${newRole === 'editor' ? 'border-indigo-600 bg-indigo-50/50 shadow-inner' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                            >
                                <span className={`text-xs font-black uppercase tracking-widest ${newRole === 'editor' ? 'text-indigo-600' : 'text-slate-400'}`}>Editor</span>
                                <span className="text-[10px] text-slate-500 font-bold leading-tight">Pode criar, editar e publicar posts. Não altera configurações globais.</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setNewRole('admin')}
                                className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-2 ${newRole === 'admin' ? 'border-indigo-600 bg-indigo-50/50 shadow-inner' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                            >
                                <span className={`text-xs font-black uppercase tracking-widest ${newRole === 'admin' ? 'text-indigo-600' : 'text-slate-400'}`}>Admin</span>
                                <span className="text-[10px] text-slate-500 font-bold leading-tight">Controle total do sistema, incluindo CRM, Funis e APIs.</span>
                            </button>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting || !newEmail}
                            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>Validar e Convidar <Plus size={20} /></>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
