
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { BlogPost } from '../types';
import { ArrowRight } from 'lucide-react';
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: theme.primaryColor }}></div>
      </div>
    );
  }

  const featuredPost = posts.length > 0 ? posts[0] : null;
  const secondaryPosts = posts.length > 1 ? posts.slice(1, 3) : [];
  const standardPosts = posts.length > 3 ? posts.slice(3) : [];

  return (
    <div className="space-y-12">
      {featuredPost && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 group relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500">
             <Link to={`/post/${featuredPost.slug}`} className="block h-full w-full">
                {featuredPost.coverImage ? (
                    <img src={featuredPost.coverImage} alt={featuredPost.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full bg-slate-200" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8">
                    <span className="inline-block px-3 py-1 mb-3 text-xs font-bold uppercase tracking-wider text-white rounded w-fit" style={{ backgroundColor: theme.primaryColor }}>
                        {featuredPost.tags[0] || 'News'}
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight drop-shadow-sm">{featuredPost.title}</h2>
                    <p className="text-slate-200 line-clamp-2 md:text-lg max-w-2xl mb-2">{featuredPost.summary}</p>
                    <div className="text-slate-300 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.primaryColor }}></span>
                        {formatTimeAgo(featuredPost.createdAt)}
                    </div>
                </div>
            </Link>
          </div>

          <div className="flex flex-col gap-6 h-[500px]">
             {secondaryPosts.map((post) => (
                 <Link key={post.id} to={`/post/${post.slug}`} className="flex-1 relative rounded-2xl overflow-hidden group shadow-sm hover:shadow-md transition-all">
                    {post.coverImage ? (
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full bg-slate-200" />
                    )}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5">
                        <span className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.primaryColor }}>{post.tags[0] || 'Article'}</span>
                        <h3 className="text-xl font-bold text-white leading-snug group-hover:underline decoration-2 underline-offset-4">{post.title}</h3>
                        <span className="text-slate-400 text-xs mt-2">{formatTimeAgo(post.createdAt)}</span>
                     </div>
                 </Link>
             ))}
          </div>
        </section>
      )}

      {standardPosts.length > 0 && (
          <section>
             <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-1 rounded-full" style={{ backgroundColor: theme.primaryColor }}></div>
                <h3 className="text-2xl font-bold text-slate-900">Latest Stories</h3>
             </div>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {standardPosts.map((post) => (
                <article key={post.id} className="flex flex-col bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-100 group">
                    <Link to={`/post/${post.slug}`} className="block h-48 overflow-hidden relative">
                         {post.coverImage && <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />}
                        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur px-2 py-1 text-xs font-bold rounded text-slate-900 shadow-sm uppercase">{post.tags[0]}</span>
                    </Link>
                    <div className="flex-1 p-5 flex flex-col">
                    <h2 className="text-lg font-bold text-slate-900 mb-2 leading-snug group-hover:text-[var(--primary-color)] transition-colors">
                        <Link to={`/post/${post.slug}`}>{post.title}</Link>
                    </h2>
                    <p className="text-slate-600 mb-4 text-sm line-clamp-3 flex-grow">{post.summary}</p>
                    <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium">
                        <span>{formatTimeAgo(post.createdAt)}</span>
                        <span className="flex items-center gap-1 text-[var(--secondary-color)]">Read <ArrowRight size={12} /></span>
                    </div>
                    </div>
                </article>
                ))}
            </div>
          </section>
      )}
    </div>
  );
};
