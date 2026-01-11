
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { BlogPost, PostStatus } from '../types';
import { 
  Plus, 
  Trash2, 
  Eye, 
  Edit, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Search,
  MessageSquare,
  Mail,
  GitFork,
  Layout as LayoutIcon,
  Users,
  Shield
} from 'lucide-react';

type SortColumn = 'title' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export const AdminDashboard: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await dbService.getAllPosts();
      setPosts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este post?')) {
      await dbService.deletePost(id);
      fetchPosts();
    }
  };

  const handleToggleStatus = async (post: BlogPost) => {
      const newStatus = post.status === PostStatus.DRAFT ? PostStatus.PUBLISHED : PostStatus.DRAFT;
      await dbService.updatePost(post.id, { status: newStatus });
      fetchPosts();
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const processedPosts = React.useMemo(() => {
    let result = [...posts];
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(lowerTerm) || 
        post.slug.toLowerCase().includes(lowerTerm)
      );
    }
    result.sort((a, b) => {
      let aValue: any = a[sortColumn];
      let bValue: any = b[sortColumn];
      if (sortColumn === 'createdAt') {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [posts, searchTerm, sortColumn, sortDirection]);

  const totalPages = Math.ceil(processedPosts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPosts = processedPosts.slice(indexOfFirstItem, indexOfLastItem);

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return <div className="w-4 h-4 ml-1 inline-block" />;
    return sortDirection === 'asc' ? <ChevronUp size={14} className="ml-1 inline-block" /> : <ChevronDown size={14} className="ml-1 inline-block" />;
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
            currentPage === i 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-600 hover:bg-slate-200 hover:text-indigo-600'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="space-y-8">
      {/* Quick Tools Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Link to="/admin/create" className="flex flex-col items-center justify-center p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all group">
          <Plus size={24} className="mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">Novo Post</span>
        </Link>
        <Link to="/admin/whatsapp" className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:border-green-500 hover:text-green-600 transition-all group">
          <MessageSquare size={24} className="mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">WhatsApp</span>
        </Link>
        <Link to="/admin/email" className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:border-blue-500 hover:text-blue-600 transition-all group">
          <Mail size={24} className="mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">E-mail</span>
        </Link>
        <Link to="/admin/funnels" className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:border-purple-500 hover:text-purple-600 transition-all group">
          <GitFork size={24} className="mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">Funis</span>
        </Link>
        <Link to="/admin/landing" className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:border-pink-500 hover:text-pink-600 transition-all group">
          <LayoutIcon size={24} className="mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">Landings</span>
        </Link>
        <Link to="/admin/debug" className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:border-red-500 hover:text-red-600 transition-all group">
          <Shield size={24} className="mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">Debug DB</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gerenciamento de Conteúdo</h1>
          <p className="text-slate-500 mt-1">Monitore e edite seus artigos gerados por IA.</p>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-slate-200">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Pesquisar posts..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm transition duration-150"
                />
            </div>
            
             <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                <span className="text-slate-400 uppercase text-[10px] font-black tracking-widest">Itens:</span>
                <select 
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="border-slate-200 rounded-lg text-sm focus:ring-indigo-500 py-1.5 px-3 bg-white shadow-sm"
                >
                    <option value={5}>5 por página</option>
                    <option value={10}>10 por página</option>
                    <option value={25}>25 por página</option>
                    <option value={50}>50 por página</option>
                </select>
            </div>
        </div>

        {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Sincronizando banco de dados...</span>
            </div>
        ) : (
            <>
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('title')}>
                        <div className="flex items-center">Título <SortIcon column="title" /></div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                        <div className="flex items-center">Status <SortIcon column="status" /></div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('createdAt')}>
                        <div className="flex items-center">Data <SortIcon column="createdAt" /></div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                {currentPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900 max-w-xs truncate">{post.title}</div>
                        <div className="text-[10px] text-slate-400 max-w-xs truncate font-mono">/{post.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                            onClick={() => handleToggleStatus(post)}
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-black rounded-full transition-all border ${
                            post.status === PostStatus.PUBLISHED 
                                ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' 
                                : 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100'
                            }`}
                        >
                            {post.status}
                        </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                        {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                            <Link to={`/admin/edit/${post.id}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Editar"><Edit size={18} /></Link>
                            <Link to={`/post/${post.slug}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Ver no Blog"><Eye size={18} /></Link>
                            <button onClick={() => handleDelete(post.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Excluir"><Trash2 size={18} /></button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            {processedPosts.length === 0 && (
                <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-2">
                    <Search size={40} className="opacity-20" />
                    <p className="font-bold">Nenhum post encontrado para os critérios selecionados.</p>
                </div>
            )}
            </div>

            {processedPosts.length > 0 && (
                <div className="px-6 py-5 border-t border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex flex-col text-xs text-slate-500">
                        <span className="font-medium">
                            Exibindo <span className="text-slate-900 font-bold">{indexOfFirstItem + 1}</span> a <span className="text-slate-900 font-bold">{Math.min(indexOfLastItem, processedPosts.length)}</span>
                        </span>
                        <span className="opacity-60">Total de {processedPosts.length} artigos registrados</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                            disabled={currentPage === 1} 
                            className="p-2 border border-slate-200 rounded-lg bg-white text-slate-400 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-all shadow-sm"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        
                        <div className="flex items-center gap-1 mx-2">
                            {renderPageNumbers()}
                        </div>

                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                            disabled={currentPage === totalPages} 
                            className="p-2 border border-slate-200 rounded-lg bg-white text-slate-400 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-all shadow-sm"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Página <span className="text-indigo-600">{currentPage}</span> / {totalPages}
                    </div>
                </div>
            )}
            </>
        )}
      </div>
    </div>
  );
};
