/**
 * EMPIRE ARCHITECT v22: ADMIN HUB RECOVERY & PERMANENCE
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({ projectId: "smart-web-builder-ai" });
}
const db = admin.firestore();

const API_KEY = process.env['GEMINI_API_KEY'];
const ADSENSE_PUB_ID = "ca-pub-2895136878543415";
const SECRET_HUB_PATH = "portal-x-873431";

export class AutonomousManager {
  private masterPath = path.join(process.cwd(), 'master-empire-site');

  async run() {
    console.log("🛠️ INITIATING v22 ADMIN HUB RECOVERY");
    
    if (!fs.existsSync(this.masterPath)) fs.mkdirSync(this.masterPath, { recursive: true });
    const publicDir = path.join(this.masterPath, 'public');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

    try {
      // 1. REBUILD THE SECRET ADMIN HUB (The specific folder was missing)
      await this.forceRebuildAdminHub();

      // 2. REBUILD THE FRONT DOOR
      await this.generatePublicFrontDoor();

      // 3. DEPLOY
      await this.deploy();

      console.log("✅ Admin Hub Rebuilt and Deployed.");

    } catch (e: any) {
      console.error("v22 Error:", e.message);
    }
  }

  private async forceRebuildAdminHub() {
    const hubDir = path.join(this.masterPath, 'public', SECRET_HUB_PATH);
    if (!fs.existsSync(hubDir)) fs.mkdirSync(hubDir, { recursive: true });

    const niches = await db.collection("network_niches").orderBy("timestamp", "desc").get();
    const linksJson = JSON.stringify(niches.docs.map(d => d.data()));

    const hubHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="robots" content="noindex, nofollow">
    <title>MASTER COMMAND v22</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'JetBrains Mono', monospace; background-color: #020617; color: #94a3b8; }
        .glass { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(30, 41, 59, 0.5); }
    </style>
</head>
<body class="p-8 md:p-20">
    <div class="max-w-6xl mx-auto">
        <header class="mb-20">
            <h1 class="text-4xl font-black text-white tracking-tighter mb-2 underline decoration-indigo-500 decoration-4">MASTER PORTAL v22</h1>
            <p class="text-xs font-bold uppercase tracking-[0.3em] text-slate-500 text-green-500 animate-pulse">> SYSTEM RECOVERED: ONLINE</p>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <section class="glass rounded-[2.5rem] p-12">
                <h2 class="text-white font-black mb-10 text-xl tracking-tight">ACTIVE REPOSITORIES</h2>
                <div id="nicheList" class="space-y-6"></div>
            </section>
            
            <aside class="glass rounded-[2.5rem] p-10 h-fit">
                <p class="text-[10px] font-black uppercase tracking-widest mb-6">Monetization Active</p>
                <p class="text-white font-bold text-lg mb-6">${ADSENSE_PUB_ID}</p>
                <div class="p-6 bg-slate-950/50 rounded-3xl border border-slate-800">
                    <p class="text-slate-500 text-xs font-bold mb-2">Self-Heal Status</p>
                    <p class="text-2xl font-black text-green-400">OPERATIONAL</p>
                </div>
            </aside>
        </div>
    </div>

    <script>
        const niches = ${linksJson};
        const list = document.getElementById('nicheList');
        niches.forEach(n => {
            const div = document.createElement('div');
            div.className = "p-6 border border-slate-800 rounded-2xl flex justify-between items-center hover:bg-slate-800/50 transition cursor-pointer";
            div.innerHTML = \`<div><h3 class='text-white font-bold mb-1'>\${n.name}</h3><p class='text-[10px] opacity-50 uppercase'>PATH: /\${n.slug}/</p></div><a href='/\${n.slug}/' class='text-indigo-400 font-black text-xs underline'>ACTIVATE →</a>\`;
            list.appendChild(div);
        });
    </script>
</body>
</html>`;
    fs.writeFileSync(path.join(hubDir, 'index.html'), hubHtml);
  }

  private async generatePublicFrontDoor() {
    const html = `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<meta name="google-site-verification" content="QJquzNdP1VHrm4V35ybWLGwN-s7T-hd0nFKQnRGHcps" />
<script src="https://cdn.tailwindcss.com"></script></head>
<body class="bg-[#020617] text-white flex items-center justify-center h-screen font-sans text-center">
<div class="max-w-lg px-8"><h1 class="text-6xl font-black tracking-tighter uppercase mb-4 text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-indigo-600">BioRegen</h1>
<p class="text-slate-500 text-xl font-light uppercase tracking-widest">Authority Node Recovered</p></div>
</body></html>`;
    fs.writeFileSync(path.join(this.masterPath, 'public/index.html'), html);
  }

  private async deploy() {
    process.chdir(this.masterPath);
    try { execSync('firebase deploy --only hosting --project smart-web-builder-ai'); } finally { process.chdir('..'); }
  }
}
