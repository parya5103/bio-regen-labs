
export const NEXTJS_SITE_TEMPLATE = (niche: string, description: string) => ({
  'app/layout.tsx': `
    import "./globals.css";
    export default function RootLayout({ children }) {
      return (
        <html lang="en">
          <body className="bg-slate-50 text-slate-900 font-sans">
            <nav className="p-6 border-b bg-white flex justify-between items-center max-w-5xl mx-auto rounded-b-2xl shadow-sm">
              <h1 className="text-2xl font-black text-indigo-600">${niche}</h1>
              <div className="space-x-8 font-medium">
                <a href="/">Home</a>
                <a href="/blog">Articles</a>
                <a href="/about">About</a>
              </div>
            </nav>
            <main className="max-w-5xl mx-auto py-12 px-6">{children}</main>
            <footer className="text-center py-20 text-slate-400 border-t mt-20">
              © 2025 ${niche}. Optimized by Distributed Multi-Agent AI.
            </footer>
          </body>
        </html>
      );
    }
  `,
  'app/page.tsx': `
    export default function Home() {
      return (
        <div className="space-y-20">
          <header className="text-center space-y-6 py-20">
            <h2 className="text-7xl font-extrabold tracking-tight underline decoration-indigo-500">${niche}</h2>
            <p className="text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">${description}</p>
          </header>
          
          <section className="grid md:grid-cols-2 gap-12">
            <div className="p-10 bg-white rounded-3xl shadow-xl border border-slate-100">
              <h3 className="text-3xl font-bold mb-4">Latest Insights</h3>
              <p className="text-slate-500 mb-6">Expert analysis on the cutting edge of ${niche}.</p>
              <div className="h-2 w-20 bg-indigo-500 rounded-full"></div>
            </div>
            <div className="p-10 bg-white rounded-3xl shadow-xl border border-slate-100">
              <h3 className="text-3xl font-bold mb-4">Case Studies</h3>
              <p className="text-slate-500 mb-6">Real-world data applied to modern challenges.</p>
              <div className="h-2 w-20 bg-pink-500 rounded-full"></div>
            </div>
          </section>
        </div>
      );
    }
  `
});
