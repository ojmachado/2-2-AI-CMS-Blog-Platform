
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { BlogPost, PostStatus } from '../types';
import { 
  Plus, 
  Trash2, 
  Eye, 
  Edit, 
  Search, 
  MessageSquare, 
  Mail, 
  GitFork, 
  Layout as LayoutIcon, 
  Users, 
  ExternalLink, 
  PenTool, 
  Settings, 
  Loader2,
  TrendingUp,
  FileText
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await dbService.getAllPosts();
      setPosts(data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (id: string) => {
      if (window.confirm("Deseja realmente remover este artigo?")) {
          await dbService.deletePost(id);
          fetchPosts();
      }
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Painel de Controle</h1>
            <p className="text-slate-500 mt-1">Gerencie seu ecossistema de conteúdo e conversão.</p>
        </div>
        <div className="flex items-center gap-3">
            <Link to="/" className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm" title="Ver Site">
                <ExternalLink size={20} />
            </Link>
            <Link to="/admin/create" className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95">
                <Plus size={20} /> Novo Artigo
            </Link>
        </div>
      </header>

      {/* Quick Actions Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        <Link to="/admin/create" className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><PenTool size={24} /></div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-900 transition-colors text-center">Criar Post</span>
        </Link>
        <Link to="/admin/users" className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors"><Users size={24} /></div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-900 transition-colors text-center">Equipe</span>
        </Link>
        <Link to="/admin/whatsapp" className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
          <div className="p-3 bg-green-50 text-green-600 rounded-2xl mb-3 group-hover:bg-green-600 group-hover:text-white transition-colors"><MessageSquare size={24} /></div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-900 transition-colors text-center">WhatsApp</span>
        </Link>
        <Link to="/admin/email" className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Mail size={24} /></div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-900 transition-colors text-center">E-mail</span>
        </Link>
        <Link to="/admin/landing" className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
          <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl mb-3 group-hover:bg-pink-600 group-hover:text-white transition-colors"><LayoutIcon size={24} /></div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-900 transition-colors text-center">Landing</span>
        </Link>
        <Link to="/admin/settings" className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
          <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl mb-3 group-hover:bg-slate-900 group-hover:text-white transition-colors"><Settings size={24} /></div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-900 transition-colors text-center">Ajustes</span>
        </Link>
      </section>

      {/* Post Table Section */}
      <section className="bg-white shadow-2xl shadow-slate-100 rounded-[2.5rem] overflow-hidden border border-slate-100">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-indigo-600" size={24} />
              <h2 className="text-xl font-black text-slate-900">Artigos Publicados</h2>
            </div>
            <div className="text-xs font-bold text-slate-400 bg-white px-4 py-2 rounded-full uppercase tracking-widest border border-slate-100">{posts.length} artigos totais</div>
        </div>

        <div className="p-4">
            {loading ? (
                <div className="p-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Carregando Artigos...</p>
                </div>
            ) : posts.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
                    <Search className="text-slate-200" size={48} />
                    <p className="text-slate-400 font-bold text-sm">Nenhum post foi gerado ainda.</p>
                    <Link to="/admin/create" className="text-indigo-600 font-black uppercase text-xs tracking-widest underline underline-offset-8">Começar Agora</Link>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead>
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Artigo</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-50">
                            {posts.map(post => (
                                <tr key={post.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="text-xs text-slate-500 font-black flex items-center gap-2">
                                            <FileText size={14} className="text-slate-300" />
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{post.title}</div>
                                        <div className="text-[10px] text-slate-400 font-mono mt-1">/{post.slug}</div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className={`px-4 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest border ${post.status === 'PUBLISHED' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                            {post.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right whitespace-nowrap">
                                        <div className="flex justify-end gap-2">
                                            <Link to={`/admin/edit/${post.id}`} className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-2xl transition-all shadow-sm shadow-transparent hover:shadow-indigo-100" title="Editar"><Edit size={18} /></Link>
                                            <Link to={`/post/${post.slug}`} className="p-3 text-slate-300 hover:text-blue-600 hover:bg-white rounded-2xl transition-all shadow-sm shadow-transparent hover:shadow-blue-100" title="Visualizar"><Eye size={18} /></Link>
                                            <button onClick={() => handleDelete(post.id)} className="p-3 text-slate-300 hover:text-red-600 hover:bg-white rounded-2xl transition-all shadow-sm shadow-transparent hover:shadow-red-100" title="Excluir"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </section>
    </div>
  );
};
