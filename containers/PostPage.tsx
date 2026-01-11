
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { dbService } from '../services/dbService';
import { metaCapiService } from '../services/metaCapiService';
import { BlogPost } from '../types';
import { Calendar, ArrowLeft, Clock, List, Share2, ChevronRight, User as UserIcon, BookOpen } from 'lucide-react';
import { AdUnit } from '../components/AdUnit';
import { useTheme } from '../contexts/ThemeContext';

const ReadingProgressBar = ({ width }: { width: number }) => {
  const { theme } = useTheme();
  return (
    <div className="fixed top-0 left-0 w-full h-1.5 z-[100] bg-white/10 backdrop-blur-sm">
      <div className="h-full transition-all duration-150 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]" style={{ width: `${width}%`, backgroundColor: theme.primaryColor }} />
    </div>
  );
};

export const PostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string>('');
  const [width, setWidth] = useState(0);
  const { theme } = useTheme();

  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const processedContent = useMemo(() => {
      if (!post) return '';
      return post.content.replace(/\\n/g, '\n').replace(/&nbsp;/g, ' ').trim();
  }, [post]);

  const toc = useMemo(() => {
    if (!processedContent) return [];
    const headings: { id: string; text: string; level: number }[] = [];
    processedContent.split('\n').forEach(line => {
      const match = line.match(/^(#{2,3})\s+(.*)/);
      if (match) {
        const text = match[2].replace(/[#*`_]/g, '').trim();
        headings.push({ id: slugify(text), text, level: match[1].length });
      }
    });
    return headings;
  }, [processedContent]);

  useEffect(() => {
    const scrollHandler = () => {
      const scrollTotal = window.scrollY;
      const heightWin = document.documentElement.scrollHeight - window.innerHeight;
      if (heightWin > 0) setWidth(Math.min(100, Math.max(0, (scrollTotal / heightWin) * 100)));
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });
    return () => window.removeEventListener('scroll', scrollHandler);
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      try {
        const data = await dbService.getPostBySlug(slug);
        setPost(data || null);
        if (data) metaCapiService.sendViewContent(data.title, data.slug);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchPost();
  }, [slug]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  if (!post) return <div className="text-center py-20 font-bold text-slate-400 text-xl">Artigo não encontrado.</div>;

  return (
    <>
      <ReadingProgressBar width={width} />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 pt-12">
          <article className="flex-1 min-w-0 pb-32">
            <Link to="/" className="inline-flex items-center text-slate-400 hover:text-indigo-600 mb-12 text-xs font-black uppercase tracking-widest transition-all group">
              <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Voltar
            </Link>

            <header className="mb-16">
                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 mb-10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200"><UserIcon size={16} /></div>
                        <span className="font-bold text-slate-900">{post.author}</span>
                    </div>
                    <span className="flex items-center gap-2 font-medium"><Calendar size={14} /> {new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-12 tracking-tight">{post.title}</h1>
            </header>

            {post.coverImage && <img src={post.coverImage} className="w-full rounded-[3rem] shadow-2xl mb-24 aspect-video object-cover" alt={post.title} />}

            <div className="max-w-[70ch] mx-auto lg:mx-0">
                <div className="prose prose-slate prose-lg md:prose-xl max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{processedContent}</ReactMarkdown>
                </div>
                <AdUnit className="mt-24" />
            </div>
          </article>

          <aside className="w-full lg:w-80 lg:shrink-0 order-first lg:order-last mb-12 lg:mb-0">
              <div className="sticky top-28 space-y-8">
                  {toc.length > 0 && (
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
                        <h4 className="font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-widest text-[10px] text-indigo-50"><List size={14} /> Índice</h4>
                        <nav className="space-y-1">
                            {toc.map((item) => (
                                <a key={item.id} href={`#${item.id}`} className={`group flex items-start gap-3 py-3 text-xs transition-all duration-300 rounded-xl px-3 -mx-3 ${activeId === item.id ? 'text-indigo-600 font-black' : 'text-slate-400'}`}>
                                    <ChevronRight size={12} className="mt-0.5 shrink-0" />
                                    <span className="leading-snug">{item.text}</span>
                                </a>
                            ))}
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
