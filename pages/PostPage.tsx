
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { dbService } from '../services/dbService';
import { metaCapiService } from '../services/metaCapiService';
import { BlogPost } from '../types';
import { 
  Calendar, 
  ArrowLeft, 
  Clock, 
  List, 
  Share2, 
  User as UserIcon, 
  Bookmark,
  Hash
} from 'lucide-react';
import { AdUnit } from '../components/AdUnit';
import { useTheme } from '../contexts/ThemeContext';

const ReadingProgressBar = ({ width }: { width: number }) => {
  const { theme } = useTheme();
  return (
    <div className="fixed top-0 left-0 w-full h-1.5 z-[110] bg-slate-100/20 backdrop-blur-md overflow-hidden">
      <div 
        className="h-full transition-all duration-300 ease-out" 
        style={{ 
            width: `${width}%`, 
            backgroundColor: theme.primaryColor,
            boxShadow: `0 0 10px ${theme.primaryColor}`
        }} 
      />
    </div>
  );
};

export const PostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string>('');
  const [scrollPercent, setScrollPercent] = useState(0);
  const { theme } = useTheme();
  const observer = useRef<IntersectionObserver | null>(null);

  const slugify = (text: string) => 
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const cleanContent = (content: string, titleToStrip: string) => {
    let cleaned = content
        .replace(/\\n/g, '\n')
        .replace(/&nbsp;/g, ' ')
        .trim();

    const titleLower = titleToStrip.toLowerCase().trim();
    const lines = cleaned.split('\n');
    const firstLine = lines[0]?.toLowerCase().replace(/[#*]/g, '').trim() || '';
    
    if (firstLine === titleLower || cleaned.startsWith(titleToStrip)) {
        cleaned = lines.slice(1).join('\n').trim();
    }
    
    return cleaned;
  };

  const processedContent = useMemo(() => {
      if (!post) return '';
      return cleanContent(post.content, post.title);
  }, [post]);

  const wordCount = useMemo(() => {
      return processedContent.split(/\s+/).filter(Boolean).length;
  }, [processedContent]);

  const readTime = useMemo(() => {
      return Math.ceil(wordCount / 225) || 1; 
  }, [wordCount]);

  const toc = useMemo(() => {
    if (!processedContent) return [];
    const headings: { id: string; text: string; level: number }[] = [];
    const lines = processedContent.split('\n');
    
    lines.forEach(line => {
      const match = line.match(/^(#{2,3})\s+(.*)/);
      if (match) {
        const level = match[1].length;
        const text = match[2].replace(/[#*`_]/g, '').trim();
        headings.push({ id: slugify(text), text, level });
      }
    });
    return headings;
  }, [processedContent]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTotal = window.scrollY;
      const heightWin = document.documentElement.scrollHeight - window.innerHeight;
      if (heightWin > 0) {
        setScrollPercent((scrollTotal / heightWin) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      try {
        const data = await dbService.getPostBySlug(slug);
        setPost(data || null);
        if (data) metaCapiService.sendViewContent(data.title, data.slug);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (loading || !post || toc.length === 0) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0.1 }
    );

    const headings = document.querySelectorAll('h2, h3');
    headings.forEach((h) => observer.current?.observe(h));

    return () => observer.current?.disconnect();
  }, [loading, post, toc]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 bg-white">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Carregando Artigo...</p>
    </div>
  );

  if (!post) return (
    <div className="max-w-xl mx-auto py-32 text-center px-4">
        <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tighter">Conteúdo não encontrado</h1>
        <p className="text-slate-500 mb-10 text-lg">O link pode estar quebrado ou o post foi removido.</p>
        <Link to="/" className="inline-flex items-center bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl">
            <ArrowLeft className="mr-3" size={18} /> Voltar ao Início
        </Link>
    </div>
  );

  const markdownComponents = {
    h2: ({ children }: any) => {
      const id = slugify(children.toString());
      return (
        <h2 id={id} className="scroll-mt-32 text-3xl md:text-4xl font-black text-slate-900 mt-16 mb-8 tracking-tight flex items-center gap-3 group">
          <Hash className="text-indigo-200 group-hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100" size={24} />
          {children}
        </h2>
      );
    },
    h3: ({ children }: any) => {
      const id = slugify(children.toString());
      return <h3 id={id} className="scroll-mt-32 text-2xl font-bold text-slate-800 mt-10 mb-6 tracking-tight">{children}</h3>;
    },
    p: ({ children }: any) => <p className="mb-8 leading-[1.8] text-slate-700 text-lg md:text-xl font-normal">{children}</p>,
    ul: ({ children }: any) => <ul className="list-disc pl-8 mb-10 space-y-4 text-slate-700 text-lg md:text-xl marker:text-indigo-300">{children}</ul>,
    li: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-8 border-indigo-600 bg-indigo-50/30 py-8 px-10 italic rounded-r-3xl mb-12 text-slate-800 text-xl md:text-2xl leading-relaxed font-serif">
        {children}
      </blockquote>
    ),
    img: ({ src, alt }: any) => (
      <img src={src} alt={alt} className="rounded-3xl shadow-xl border border-slate-100 my-10 w-full" />
    )
  };

  return (
    <>
      <ReadingProgressBar width={scrollPercent} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 pt-12">
          
          <article className="flex-1 min-w-0 pb-40">
            <Link to="/" className="inline-flex items-center text-slate-400 hover:text-indigo-600 mb-12 text-[10px] font-black uppercase tracking-[0.2em] transition-all group">
              <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
              Feed Principal
            </Link>

            <header className="mb-16">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.05] mb-8 tracking-tighter">
                    {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 border-t border-slate-100 pt-8">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm">
                            <UserIcon size={18} />
                        </div>
                        <span className="font-black text-slate-900 text-xs uppercase tracking-widest">{post.author || 'IA Intelligence'}</span>
                    </div>
                    <span className="flex items-center gap-2 font-bold text-xs">
                        <Calendar size={14} className="text-indigo-500" /> 
                        {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="flex items-center gap-2 font-black text-white px-3 py-1 rounded-full text-[9px] uppercase tracking-widest" style={{ backgroundColor: theme.primaryColor }}>
                        <Clock size={12} /> 
                        {readTime} MIN LEITURA
                    </span>
                </div>
            </header>

            {post.coverImage && (
                <div className="relative mb-20 group">
                    <img 
                        src={post.coverImage} 
                        className="w-full rounded-[3.5rem] shadow-2xl aspect-[21/9] object-cover border border-slate-100 transform transition-transform duration-700 group-hover:scale-[1.01]" 
                        alt={post.title} 
                    />
                </div>
            )}

            <div className="max-w-[75ch] mx-auto lg:mx-0">
                <div className="prose prose-slate prose-lg md:prose-xl max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-indigo-600 prose-a:font-bold prose-strong:text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                    >
                        {processedContent}
                    </ReactMarkdown>
                </div>
                
                <div className="mt-32 p-12 bg-slate-900 rounded-[3rem] text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <Share2 className="mx-auto mb-6 text-indigo-400" size={40} />
                        <h4 className="font-black text-3xl mb-4 tracking-tight">Gostou da leitura?</h4>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto text-lg">Compartilhe este conteúdo com sua rede para disseminar conhecimento.</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Link copiado para a área de transferência!');
                                }}
                                className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-2"
                            >
                                <Bookmark size={16} /> Copiar Link
                            </button>
                        </div>
                    </div>
                </div>

                <AdUnit className="mt-20" />
            </div>
          </article>

          <aside className="w-full lg:w-80 lg:shrink-0 order-first lg:order-last mb-12 lg:mb-0 hidden lg:block">
              <div className="sticky top-32 space-y-8">
                  
                  {/* ToC */}
                  {toc.length > 0 && (
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                        <h4 className="font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-widest text-[10px] text-slate-400">
                            <List size={14} className="text-indigo-600" /> Neste Artigo
                        </h4>
                        <nav className="relative">
                            {/* Linha vertical de progresso (visual) */}
                            <div className="absolute left-[5px] top-2 bottom-2 w-[2px] bg-slate-100 rounded-full"></div>
                            
                            <div className="space-y-1">
                                {toc.map((item) => (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        className={`group flex items-start gap-3 py-2 text-[11px] transition-all duration-300 rounded-xl px-4 -mx-2 relative z-10 ${
                                            item.id === activeId 
                                                ? 'text-indigo-600 font-black bg-indigo-50/50' 
                                                : 'text-slate-500 font-medium hover:text-slate-800 hover:bg-slate-50'
                                        } ${item.level === 3 ? 'pl-8' : ''}`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 transition-all ${
                                            item.id === activeId ? 'bg-indigo-600 scale-125' : 'bg-slate-300 group-hover:bg-slate-400'
                                        }`}></span>
                                        <span className="leading-snug">{item.text}</span>
                                    </a>
                                ))}
                            </div>
                        </nav>
                    </div>
                  )}
              </div>
          </aside>
        </div>
      </div>
    </>
  );
};
