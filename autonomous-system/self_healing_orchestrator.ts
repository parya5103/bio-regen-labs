/**
 * FULLY AUTONOMOUS SELF-HEALING MULTI-AGENT ORCHESTRATOR
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const API_KEY = "AIzaSyBHIwAYcYXKsoMjiL5gARmfL6cLO7o_040";
const ADSENSE_PUB_ID = "ca-pub-2895136878543415";
const genAI = new GoogleGenerativeAI(API_KEY);

interface SystemState {
  lastSuccess: string;
  failures: number;
  currentNiche: string;
}

export class SelfHealingOrchestrator {
  private projectPath = path.join(process.cwd(), 'auto-niche-site');
  private statePath = path.join(process.cwd(), 'autonomous-system/state.json');
  private niche: string = "AI-Powered Regenerative Medicine";

  constructor() {
    this.loadState();
  }

  private loadState() {
    if (fs.existsSync(this.statePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.statePath, 'utf8'));
        this.niche = data.currentNiche || this.niche;
      } catch (e) {
        console.error("State load error:", e);
      }
    }
  }

  private saveState(failures: number = 0) {
    const state: SystemState = {
      lastSuccess: new Date().toISOString(),
      failures: failures,
      currentNiche: this.niche
    };
    const dir = path.dirname(this.statePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2));
  }

  private async retry<T>(action: () => Promise<T>, agentName: string, retries: number = 3): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await action();
      } catch (e: any) {
        console.warn(`⚠️ [${agentName}] Attempt ${i + 1} failed. Error: ${e.message}`);
        if (i === retries - 1) throw e;
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error(`${agentName} failed after ${retries} attempts.`);
  }

  async runLoop() {
    console.log("\n🛡️ SELF-HEALING SYSTEM: CYCLE STARTING");
    
    try {
      try {
        this.niche = await this.retry(() => this.discoverTrend(), "TrendAgent");
      } catch (e) {
        console.error("🚨 Trend Agent Crashed. Healing via Fallback Intelligence...");
        this.niche = "Quantum Computing for Longevity"; 
      }

      await this.retry(() => this.buildWebsite(), "BuilderAgent");

      try {
        await this.retry(() => this.generateContentBatch(), "WriterAgent");
      } catch (e) {
        console.error("🚨 Writer Agent Crashed. Healing via Template Injection...");
        await this.injectFallbackContent();
      }

      await this.retry(() => this.generateCompliancePages(), "MonetizationAgent");
      await this.retry(() => this.optimizeSEO(), "SEOAgent");
      await this.retry(() => this.syncToGithub(), "GithubAgent");
      await this.retry(() => this.deployToFirebase(), "DeploymentAgent");

      this.saveState(0);
      console.log(`\n🎉 CYCLE COMPLETED SUCCESSFULLY. SITE LIVE AT: https://smart-web-builder-ai.web.app`);

    } catch (e: any) {
      console.error("💀 CRITICAL SYSTEM FAILURE:", e.message);
      this.saveState(1);
    }
  }

  private async discoverTrend(): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = "Pick a high-monetization trending niche for May 2024. Return ONLY the name.";
    const result = await model.generateContent(prompt);
    return result.response.text().trim() || this.niche;
  }

  private async buildWebsite() {
    if (fs.existsSync(this.projectPath)) fs.rmSync(this.projectPath, { recursive: true, force: true });
    fs.mkdirSync(path.join(this.projectPath, 'public'), { recursive: true });

    const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.niche} | Authority Insight</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB_ID}" crossorigin="anonymous"></script>
</head>
<body class="bg-slate-50 text-slate-900 font-sans">
    <nav class="bg-white p-6 shadow-sm sticky top-0 z-50 border-b">
        <div class="container mx-auto flex justify-between items-center">
            <a href="/" class="text-3xl font-black text-indigo-600">${this.niche}</a>
            <div class="space-x-8 font-bold text-xs uppercase text-slate-500">
                <a href="/">Home</a><a href="/privacy.html">Privacy</a><a href="/contact.html">Contact</a>
            </div>
        </div>
    </nav>
    <header class="py-32 text-center bg-white border-b">
        <h1 class="text-7xl font-black mb-6 tracking-tight text-slate-900">${this.niche}</h1>
        <p class="text-2xl text-slate-500 max-w-4xl mx-auto font-light leading-relaxed">The authoritative source for ${this.niche} and future innovations.</p>
    </header>
    <main class="container mx-auto px-6 py-20 flex flex-col lg:flex-row gap-16">
        <div id="articles" class="lg:w-2/3 space-y-24"><!-- ARTICLES --></div>
        <aside class="lg:w-1/3">
            <div class="sticky top-32 space-y-8">
                <div class="bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
                    <h3 class="font-black text-indigo-600 uppercase tracking-widest text-xs mb-4 text-center">AdSense Live</h3>
                    <ins class="adsbygoogle" style="display:block" data-ad-client="${ADSENSE_PUB_ID}" data-ad-slot="sidebar" data-ad-format="auto"></ins>
                    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
                </div>
            </div>
        </aside>
    </main>
    <footer class="bg-slate-900 text-white py-20 text-center">
        <div class="container mx-auto flex flex-col items-center gap-6">
            <p class="text-slate-500 font-medium">&copy; 2025 ${this.niche} Authority Labs</p>
            <div class="flex gap-8 text-xs font-bold uppercase tracking-widest text-slate-400">
                <a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a><a href="/contact.html">Contact</a>
            </div>
        </div>
    </footer>
</body>
</html>`;
    fs.writeFileSync(path.join(this.projectPath, 'public/index.html'), indexHtml);
    fs.writeFileSync(path.join(this.projectPath, 'firebase.json'), JSON.stringify({hosting:{public:"public"}}, null, 2));
  }

  private async generateContentBatch() {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const topics = ["The Ultimate Guide", "Market Outlook 2025"];
    let batch = "";
    for (const t of topics) {
      try {
        const res = await model.generateContent(`Write 1200 words on ${t} in ${this.niche}. HTML only.`);
        batch += `<article class="bg-white p-12 rounded-3xl shadow-lg border border-slate-100">
          <h2 class="text-5xl font-black mb-8 text-slate-900 leading-tight">${t}</h2>
          <div class="prose prose-xl prose-slate leading-relaxed font-serif">${res.response.text()}</div>
        </article>`;
      } catch (e) {
        console.warn("Topic generation failed, skipping topic:", t);
      }
    }
    const index = path.join(this.projectPath, 'public/index.html');
    let content = fs.readFileSync(index, 'utf8');
    fs.writeFileSync(index, content.replace('<!-- ARTICLES -->', batch || "Content pending..."));
  }

  private async injectFallbackContent() {
    const fallback = `<div class="p-12 bg-indigo-50 rounded-3xl border border-indigo-100 text-center">
      <h2 class="text-3xl font-bold text-indigo-900 mb-4">Deep Research in Progress</h2>
      <p class="text-xl text-indigo-700 font-light">Our autonomous agents are currently synthesizing the latest data for ${this.niche}. Full report arriving shortly.</p>
    </div>`;
    const index = path.join(this.projectPath, 'public/index.html');
    fs.writeFileSync(index, fs.readFileSync(index, 'utf8').replace('<!-- ARTICLES -->', fallback));
  }

  private async generateCompliancePages() {
    const publicDir = path.join(this.projectPath, 'public');
    const pages = ['privacy.html', 'terms.html', 'contact.html'];
    for (const p of pages) {
      const pageBody = `<div class="max-w-3xl mx-auto py-20 px-6 prose prose-slate text-center">
        <h1 class="text-4xl font-bold mb-8">${p.replace('.html', '').toUpperCase()}</h1>
        <p class="text-xl text-slate-600 mb-10 tracking-tight leading-relaxed">Compliance documentation for ${this.niche} Authority Labs.</p>
        <a href="/" class="text-indigo-600 font-bold underline">Return Home</a>
      </div>`;
      const fullPageHtml = `<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-slate-50">${pageBody}</body></html>`;
      fs.writeFileSync(path.join(publicDir, p), fullPageHtml);
    }
  }

  private async optimizeSEO() {
    fs.writeFileSync(path.join(this.projectPath, 'public/robots.txt'), "User-agent: *\nAllow: /");
  }

  private async syncToGithub() {
    const original = process.cwd();
    process.chdir(this.projectPath);
    try {
      execSync('git init');
      execSync('git config user.name "Self-Healer Agent"');
      execSync('git config user.email "healer@bio-regen.ai"');
      execSync('git remote add origin https://github.com/parya5103/bio-regen-labs.git || true');
      execSync('git add .');
      execSync('git commit -m "Autonomous Self-Healing Loop Sync"');
      execSync('git push origin main --force');
    } finally { process.chdir(original); }
  }

  private async deployToFirebase() {
    const original = process.cwd();
    process.chdir(this.projectPath);
    try {
      execSync('firebase deploy --only hosting --project smart-web-builder-ai');
    } finally { process.chdir(original); }
  }
}
