
'use client';

import dynamic from 'next/dynamic';

// O App principal é carregado apenas no cliente para evitar conflitos com SSR
const MainApp = dynamic(() => import('../App'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
});

export default function Home() {
  return <MainApp />;
}
