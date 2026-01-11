
'use client';

import dynamic from 'next/dynamic';

// Reutiliza a lógica do App principal para qualquer sub-rota (ex: /admin, /post/123)
// Isso impede que o Next.js retorne 404 quando o usuário atualiza a página em uma rota interna
const MainApp = dynamic(() => import('../../App'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
});

export default function CatchAllPage() {
  return <MainApp />;
}
