import { runTrendDiscovery } from './agents/discovery';
import { generateHighQualityArticle } from './agents/writer';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

async function main() {
  console.log("🚀 STARTING AUTONOMOUS SYSTEM CYCLE");

  // Step 1 & 2: Trend Discovery & Validation
  const report = await runTrendDiscovery();
  console.log(`✅ Niche Selected: ${report.niche}`);
  console.log(`💡 Justification: ${report.justification}`);

  const siteDir = path.join(process.cwd(), 'bio-regen-site');
  
  // Step 3: Website Generation (Next.js + Tailwind Structure)
  console.log("🏗️ Building Website Structure...");
  if (!fs.existsSync(siteDir)) {
    fs.mkdirSync(siteDir, { recursive: true });
  }

  // Create basic Next.js files
  const files = {
    'package.json': JSON.stringify({
      name: "bio-regen-site",
      version: "0.1.0",
      private: true,
      scripts: {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint"
      },
      dependencies: {
        "next": "14.2.3",
        "react": "^18",
        "react-dom": "^18",
        "tailwindcss": "^3.4.1",
        "postcss": "^8",
        "autoprefixer": "^10.4.19"
      },
      devDependencies: {
        "typescript": "^5",
        "@types/node": "^20",
        "@types/react": "^18",
        "@types/react-dom": "^18",
        "postcss": "^8",
        "tailwindcss": "^3.4.1"
      }
    }, null, 2),
    'tailwind.config.ts': `
      import type { Config } from "tailwindcss";
      const config: Config = {
        content: [
          "./pages/**/*.{js,ts,jsx,tsx,mdx}",
          "./components/**/*.{js,ts,jsx,tsx,mdx}",
          "./app/**/*.{js,ts,jsx,tsx,mdx}",
        ],
        theme: {
          extend: {},
        },
        plugins: [],
      };
      export default config;
    `,
    'app/layout.tsx': `
      import "./globals.css";
      export default function RootLayout({ children }: { children: React.ReactNode }) {
        return (
          <html lang="en">
            <body className="bg-gray-50 text-gray-900">
              <nav className="p-6 bg-white border-b sticky top-0 z-50">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                  <a href="/" className="text-2xl font-bold text-blue-600">${report.niche}</a>
                  <div className="space-x-4">
                    <a href="/blog" className="hover:text-blue-500">Blog</a>
                    <a href="/about" className="hover:text-blue-500">About</a>
                  </div>
                </div>
              </nav>
              {children}
              <footer className="p-10 bg-white border-t mt-20 text-center">
                <p>&copy; 2025 ${report.niche}. Built by Autonomous Agents.</p>
              </footer>
            </body>
          </html>
        );
      }
    `,
    'app/page.tsx': `
      export default function Home() {
        return (
          <main className="max-w-5xl mx-auto py-20 px-6 text-center">
            <h1 className="text-6xl font-black mb-6">${report.niche}</h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">${report.justification}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               ${report.keywords.map((k: string) => `
                <div className="p-8 bg-white rounded-2xl shadow-sm border">
                  <h3 className="font-bold text-xl mb-2">${k}</h3>
                  <p className="text-gray-500">Deep dive analysis into how ${k} is changing the world.</p>
                </div>
               `).join('')}
            </div>
          </main>
        );
      }
    `,
    'app/globals.css': '@tailwind base;\n@tailwind components;\n@tailwind utilities;'
  };

  // Helper to write nested files
  Object.entries(files).forEach(([filePath, content]) => {
    const absolutePath = path.join(siteDir, filePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content);
  });

  // Step 4: Content Creation
  console.log("✍️ Generating high-quality content batch...");
  const blogDir = path.join(siteDir, 'app/blog');
  fs.mkdirSync(blogDir, { recursive: true });

  for (const article of report.suggested_articles) {
    const content = await generateHighQualityArticle(article.title, article.brief);
    const slug = article.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
    const articlePageDir = path.join(blogDir, slug);
    fs.mkdirSync(articlePageDir, { recursive: true });
    
    // Wrap markdown/text in a simple React component for Next.js app router
    const pageContent = `
      export default function Page() {
        return (
          <article className="max-w-3xl mx-auto py-20 px-6 prose lg:prose-xl">
            <div className="whitespace-pre-wrap font-sans">
              ${content.replace(/`/g, '\\`').replace(/\$/g, '\\$')}
            </div>
          </article>
        );
      }
    `;
    fs.writeFileSync(path.join(articlePageDir, 'page.tsx'), pageContent);
    console.log(`✅ Generated Article: ${article.title}`);
  }

  // Step 5: SEO (Sitemap & Robots)
  fs.writeFileSync(path.join(siteDir, 'public/robots.txt'), "User-agent: *\nAllow: /");

  // Step 6: GitHub Sync
  console.log("📤 Syncing with GitHub...");
  try {
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Autonomous Update: New articles and niche optimization"', { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });
  } catch (e) {
    console.error("Git sync failed, likely nothing to commit or connection issue.");
  }

  console.log("\n🎊 CYCLE COMPLETE");
  console.log(`Live URL: https://smart-web-builder-ai.web.app`);
}

main().catch(console.error);
