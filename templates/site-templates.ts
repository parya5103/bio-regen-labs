export const SITE_TEMPLATE = {
  layout: `
    import React from 'react';
    import '@/styles/globals.css';

    export default function RootLayout({ children }) {
      return (
        <html lang="en">
          <body className="bg-slate-50 text-slate-900 font-sans">
            <header className="p-6 border-b bg-white sticky top-0 z-50">
              <nav className="max-w-6xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold text-blue-600">BioRegen AI</h1>
                <div className="space-x-6">
                  <a href="/">Home</a>
                  <a href="/blog">Articles</a>
                  <a href="/about">About</a>
                </div>
              </nav>
            </header>
            <main className="max-w-6xl mx-auto py-12 px-6">{children}</main>
            <footer className="p-12 border-t bg-white mt-20 text-center text-slate-500">
              © 2025 BioRegen AI Labs. All rights reserved.
            </footer>
          </body>
        </html>
      );
    }
  `,
  homePage: (niche: string) => `
    export default function Home() {
      return (
        <div className="space-y-12">
          <section className="text-center py-20">
            <h2 className="text-5xl font-extrabold mb-6">Mastering ${niche}</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              The ultimate resource for data-driven longevity. We use AI to analyze the latest 
              breakthroughs in biological regeneration.
            </p>
          </section>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-xl bg-white shadow-sm">
              <h3 className="text-xl font-bold mb-3">AI Analysis</h3>
              <p>Cutting edge algorithms applied to your biomarkers.</p>
            </div>
            <div className="p-6 border rounded-xl bg-white shadow-sm">
              <h3 className="text-xl font-bold mb-3">Daily Updates</h3>
              <p>Fresh content published every 24 hours based on latest trends.</p>
            </div>
            <div className="p-6 border rounded-xl bg-white shadow-sm">
              <h3 className="text-xl font-bold mb-3">SEO Optimized</h3>
              <p>Structured for maximum visibility and ranking.</p>
            </div>
          </div>
        </div>
      );
    }
  `
};
