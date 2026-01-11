
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { BlogPost } from '../types';
import { Calendar, ArrowRight, Tag, Clock, TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

export const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await dbService.getPublishedPosts();
        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch posts", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-indigo-600"></div>
      </div>
    );
  }

  // Splitting content for layout
  const featuredPost = posts.length > 0 ? posts[0] : null;
  const secondaryPosts = posts.length > 1 ? posts.slice(1, 3) : [];
  const standardPosts = posts.length > 3 ? posts.slice(3) : [];

  return (
    <div className="space-y-16 pb-20 animate-in fade-in duration-700">
      
      {/* Hero Section: Asymmetric Grid (8 cols / 4 cols) */}
      {featuredPost && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[600px]">
          
          {/* Main Featured Post (2/3 width) */}
          <div className="lg:col-span-8 group relative h-[500px] lg:h-full rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
             <Link to={`/post/${featuredPost.slug}`} className="block h-full w-full relative">
                {featuredPost.coverImage ? (
                    <img 
                        src={featuredPost.coverImage} 
                        alt={featuredPost.title} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-800" />
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-500" />

                {/* Content Content */}
                <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full max-w-4xl">
                    <div className="flex items-center gap-3 mb-5">
                       <span 
                           className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md bg-white/20 border border-white/10"
                       >
                           {featuredPost.tags[0] || 'Destaque'}
                       </span>
                       <span className="text-white/80 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                           <Clock size={12} /> {formatTimeAgo(featuredPost.createdAt)}
                       </span>
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-[1.05] tracking-tight drop-shadow-sm group-hover:text-indigo-200 transition-colors">
                        {featuredPost.title}
                    </h2>
                    
                    <p className="text-slate-200 text-lg md:text-xl line-clamp-2 max-w-2xl mb-2 font-medium opacity-90">
                        {featuredPost.summary}
                    </p>
                </div>
            </Link>
          </div>

          {/* Secondary Posts Column (1/3 width, stacked) */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-auto lg:h-full">
             {secondaryPosts.map((post) => (
                 <Link key={post.id} to={`/post/${post.slug}`} className="flex-1 relative rounded-[2.5rem] overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300 min-h-[240px] block">
                    {post.coverImage ? (
                        <img 
                            src={post.coverImage} 
                            alt={post.title} 
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-700" />
                    )}
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90" />
                     
                     <div className="absolute bottom-0 left-0 p-8 w-full">
                        <div className="flex items-center gap-2 mb-2">
                            <span 
                                className="text-[10px] font-black uppercase tracking-[0.2em]"
                                style={{ color: theme.primaryColor }} // Accent color
                            >
                                {post.tags[0] || 'Artigo'}
                            </span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-white leading-snug group-hover:underline decoration-2 underline-offset-4 decoration-white/50">
                            {post.title}
                        </h3>
                     </div>
                 </Link>
             ))}
             
             {/* Fallback space filler if < 2 secondary posts */}
             {secondaryPosts.length < 2 && (
                 <div className="flex-1 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2 p-6 min-h-[200px]">
                     <TrendingUp size={32} className="opacity-20" />
                     <span className="text-xs font-bold uppercase tracking-widest opacity-60">Em breve</span>
                 </div>
             )}
          </div>
        </section>
      )}

      {/* Standard Grid for older posts */}
      {standardPosts.length > 0 && (
          <section>
             <div className="flex items-center gap-4 mb-8">
                <div className="h-8 w-1.5 rounded-full" style={{ backgroundColor: theme.primaryColor }}></div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Últimas Histórias</h3>
             </div>
             
             <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {standardPosts.map((post) => (
                <article key={post.id} className="flex flex-col bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 group">
                    <Link to={`/post/${post.slug}`} className="block h-56 overflow-hidden relative">
                         {post.coverImage ? (
                            <img 
                            src={post.coverImage} 
                            alt={post.title} 
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                <Tag size={32} />
                            </div>
                        )}
                        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 text-[10px] font-black rounded-lg text-slate-900 shadow-sm uppercase tracking-widest">
                            {post.tags[0]}
                        </span>
                    </Link>
                    <div className="flex-1 p-8 flex flex-col">
                        <div className="mb-4 text-xs font-bold text-slate-400 flex items-center gap-2">
                            <Calendar size={12} /> {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-indigo-600 transition-colors">
                            <Link to={`/post/${post.slug}`}>
                            {post.title}
                            </Link>
                        </h2>
                        
                        <p className="text-slate-500 mb-6 text-sm line-clamp-3 leading-relaxed flex-grow">
                            {post.summary}
                        </p>
                        
                        <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                            <span className="text-slate-400">{formatTimeAgo(post.createdAt)}</span>
                            <Link to={`/post/${post.slug}`} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors">
                                Ler Artigo <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </article>
                ))}
            </div>
          </section>
      )}

      {posts.length === 0 && !loading && (
        <div className="text-center py-32">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-100 mb-6 text-slate-400">
              <TrendingUp size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Nenhum artigo encontrado</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">O blog está aguardando as primeiras publicações. Acesse o painel administrativo para começar.</p>
          <Link to="/admin" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
              Ir para o Admin
          </Link>
        </div>
      )}
    </div>
  );
};
