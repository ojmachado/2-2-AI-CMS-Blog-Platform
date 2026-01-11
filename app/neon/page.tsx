import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';
import { RefreshCw, Send, ShieldCheck, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Helper para garantir que a URL de conexão tenha SSL, exigido pelo Neon
const getNeonUrl = () => {
  let url = process.env.POSTGRES_URL || process.env.DATABASE_URL || '';
  if (url && !url.includes('sslmode=require')) {
    // Adiciona sslmode=require se não existir
    url += (url.includes('?') ? '&' : '?') + 'sslmode=require';
  }
  return url;
};

export const dynamic = 'force-dynamic';

export default async function NeonTestPage() {
  let comments = [];
  let error = null;
  const connectionString = getNeonUrl();

  // Fetch de dados no Servidor
  try {
    const sql = neon(connectionString);
    // Cria a tabela se não existir (apenas por segurança neste teste isolado)
    await sql('CREATE TABLE IF NOT EXISTS comments (id SERIAL PRIMARY KEY, comment TEXT, created_at TIMESTAMPTZ DEFAULT NOW())');
    comments = await sql('SELECT * FROM comments ORDER BY created_at DESC LIMIT 10');
  } catch (e: any) {
    error = e.message;
  }

  // Server Action para Inserção
  async function create(formData: FormData) {
    'use server';
    const sql = neon(getNeonUrl()); // Reutiliza a função segura com SSL
    const comment = formData.get('comment');
    if (comment) {
        await sql('INSERT INTO comments (comment) VALUES ($1)', [comment.toString()]);
        revalidatePath('/neon');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
        
        <div className="bg-indigo-600 p-8 text-white relative">
            <Link href="/admin/debug" className="absolute top-6 left-6 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-center mt-2">Neon DB Test</h1>
            <p className="text-indigo-200 text-center text-sm font-medium mt-1">Validando Server Actions + SSL</p>
        </div>

        <div className="p-8 space-y-6">
            {/* Status da Conexão */}
            <div className={`p-4 rounded-2xl flex items-start gap-3 ${error ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                {error ? <AlertTriangle className="shrink-0 mt-0.5" size={18} /> : <ShieldCheck className="shrink-0 mt-0.5" size={18} />}
                <div className="text-xs">
                    <strong className="block mb-1">{error ? 'Erro de Conexão' : 'Conexão Segura (SSL)'}</strong>
                    {error ? error : 'Driver @neondatabase/serverless conectado com sucesso.'}
                </div>
            </div>

            {/* Formulário Server Action */}
            <form action={create} className="relative">
                <input 
                    type="text" 
                    name="comment" 
                    placeholder="Escreva algo para salvar no Neon..." 
                    required
                    className="w-full pl-4 pr-14 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-slate-800 placeholder:text-slate-400 font-medium"
                />
                <button type="submit" className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-all shadow-md active:scale-95">
                    <Send size={18} />
                </button>
            </form>

            {/* Lista de Comentários */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Registros Recentes</h3>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full">{comments.length} itens</span>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {comments.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm py-4 italic">Nenhum registro encontrado.</p>
                    ) : (
                        comments.map((item: any) => (
                            <div key={item.id} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex flex-col gap-1 hover:border-indigo-100 transition-colors">
                                <p className="text-slate-800 font-medium text-sm">{item.comment}</p>
                                <span className="text-[10px] text-slate-400 font-mono">
                                    {new Date(item.created_at).toLocaleString()}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}