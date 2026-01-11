// Fix: Removed @ alias to avoid module resolution errors in raw ES6 environment.
import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI CMS Blog Platform',
  description: 'A modern blog platform with an integrated AI Content Management System.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://unpkg.com/easymde/dist/easymde.min.css" />
        <link href="https://cdn.jsdelivr.net/npm/reactflow@11.10.1/dist/style.min.css" rel="stylesheet" />
        <script src="https://editor.unlayer.com/embed.js" async></script>
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased">
        <div id="root">{children}</div>
      </body>
    </html>
  );
}