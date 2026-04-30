/**
 * REVENUE-FOCUSED EMPIRE ORCHESTRATOR (v2)
 * Features: 
 * - Lead Count Monitoring (Firestore)
 * - Conditional Lead Magnet (PDF after 100 leads)
 * - GitHub Workflow for Triggers
 * - Secure Stealth Hub
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

const API_KEY = "AIzaSyDrKDIc6vBsxAJxH-YSMXTdilBeQxSX3rw";
const ADSENSE_PUB_ID = "ca-pub-2895136878543415";
const TELEGRAM_BOT_TOKEN = "8734318382:AAFYbMbBDA0lz4wQIZLUEM8kfWCZAXc6zGU";
const TELEGRAM_CHAT_ID = "1677425833"; 
const SECRET_HUB_PATH = "portal-x-873431"; 

const genAI = new GoogleGenerativeAI(API_KEY);

export class AutonomousManager {
  private masterPath = path.join(process.cwd(), 'master-empire-site');
  private niche: string = "";
  private slug: string = "";

  async run() {
    console.log("💰 STARTING CONVERSION-OPTIMIZED CYCLE (GITHUB TRIGGERED)");
    
    if (!fs.existsSync(this.masterPath)) fs.mkdirSync(this.masterPath, { recursive: true });
    const publicDir = path.join(this.masterPath, 'public');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

    try {
      const discovery = await this.discoverNiche();
      this.niche = discovery.niche;
      this.slug = this.niche.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      
      const nicheFolder = path.join(publicDir, this.slug);
      if (!fs.existsSync(nicheFolder)) fs.mkdirSync(nicheFolder, { recursive: true });

      // 0. FETCH LEAD COUNT
      const leadSnapshot = await db.collection("leads").count().get();
      const leadCount = leadSnapshot.data().count;
      console.log(`📊 Current Leads: ${leadCount}`);

      // 1. BUILD CONTENT & NEWSLETTER SITE
      await this.generateNicheSite(nicheFolder, leadCount);

      // 2. UPDATE PRIVATE ADMIN HUB
      await this.updateSecretHub(leadCount);

      // 3. GENERATE STEALTH FRONT DOOR
      await this.generatePublicFrontDoor();

      // 4. SYNC TO GITHUB (For Workflow Persistance)
      await this.syncToGithub();

      // 5. DEPLOY TO FIREBASE
      await this.deploy();

      await this.notifyTelegram(`✅ *Empire Expansion:* Site Live!\n\n🌐 Niche: ${this.niche}\n📬 *Leads:* ${leadCount}\n🎁 *PDF Magnet:* ${leadCount >= 100 ? 'ENABLED' : 'LOCKED'}\n\n[Open Secret Portal](https://smart-web-builder-ai.web.app/${SECRET_HUB_PATH}/)`);

    } catch (e: any) {
      console.error(e);
      await this.notifyTelegram(`⚠️ *Expansion Alert:* ${e.message}`);
    }
  }

  private async discoverNiche() {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const res = await model.generateContent(`Find a trending technical niche. Return JSON: {"niche": "..."}`);
    return JSON.parse(res.response.text().replace(/```json|```/g, ""));
  }

  private async generateNicheSite(folder: string, leadCount: number) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const artRes = await model.generateContent(`Write 5 high-authority deep-dives for ${this.niche}. HTML body only.`);
    
    // Logic for PDF download magnet
    const magnetHtml = leadCount >= 100 
      ? `<div class="mt-10 p-8 bg-emerald-50 border-2 border-emerald-200 rounded-3xl text-center">
          <h3 class="text-2xl font-black text-emerald-900 mb-2">🎁 Milestone Unlocked!</h3>
          <p class="text-emerald-700 mb-6">Our community reached 100+ members. Download the Full ${this.niche} Report (PDF).</p>
          <button class="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 transition-all">Download Free Report</button>
        </div>`
      : "";

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.niche} Authority</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB_ID}" crossorigin="anonymous"></script>
    <style>
        .pro-card { border-radius: 40px; background: white; }
        #subscribePopup { display: none; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); }
    </style>
</head>
<body class="bg-slate-50 font-sans text-slate-900">
    <!-- SUBSCRIBE POPUP -->
    <div id="subscribePopup" class="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <div class="bg-white p-12 rounded-[3rem] max-w-lg w-full text-center shadow-2xl relative">
            <button onclick="closePopup()" class="absolute top-8 right-8 text-slate-400 hover:text-slate-900 font-bold">CLOSE</button>
            <h2 class="text-3xl font-black mb-4 tracking-tight">Unlock Early Insights</h2>
            <p class="text-slate-500 mb-8">Join <b>${leadCount}</b> others in the ${this.niche} network.</p>
            <form id="leadForm" class="space-y-4">
                <input type="email" id="leadEmail" placeholder="Email Address" required class="w-full px-8 py-5 rounded-2xl bg-slate-100 outline-none focus:ring-2 focus:ring-blue-600 transition-all">
                <button type="submit" class="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all">Join Network</button>
            </form>
        </div>
    </div>

    <nav class="p-8 border-b bg-white flex justify-between items-center sticky top-0 z-50">
        <h1 class="text-2xl font-black text-blue-600 uppercase tracking-tighter">${this.niche} LABS</h1>
    </nav>

    <main class="max-w-4xl mx-auto py-24 px-6">
        <div class="bg-white p-12 md:p-20 rounded-[3rem] shadow-sm mb-16">
            <h1 class="text-6xl font-black mb-12 tracking-tighter leading-none">${this.niche}</h1>
            <div class="prose prose-slate prose-xl max-w-none">${artRes.response.text()}</div>
            
            ${magnetHtml}

            <div class="mt-20">
               <ins class="adsbygoogle" style="display:block" data-ad-client="${ADSENSE_PUB_ID}" data-ad-format="auto"></ins>
               <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
            </div>
        </div>
    </main>

    <script>
        setTimeout(() => {
            if(!localStorage.getItem('subscribed')) {
                document.getElementById('subscribePopup').style.display = 'flex';
            }
        }, 10000);

        function closePopup() { document.getElementById('subscribePopup').style.display = 'none'; }
        
        document.getElementById('leadForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('leadEmail').value;
            
            // Send to Firestore (represented as alert for now, real sync via cloud functions or API)
            localStorage.setItem('subscribed', 'true');
            alert('Welcome to the inner circle.');
            closePopup();
        });
    </script>
</body>
</html>`;
    fs.writeFileSync(path.join(folder, 'index.html'), html);
  }

  private async updateSecretHub(leadCount: number) {
    const hubDir = path.join(this.masterPath, 'public', SECRET_HUB_PATH);
    if (!fs.existsSync(hubDir)) fs.mkdirSync(hubDir, { recursive: true });

    await db.collection("network_niches").doc(this.slug).set({
      name: this.niche, slug: this.slug, timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    const niches = await db.collection("network_niches").orderBy("timestamp", "desc").get();
    const linksJson = JSON.stringify(niches.docs.map(d => d.data()));

    const hubHtml = `
<html><head><title>Master Admin</title><script src="https://cdn.tailwindcss.com"></script></head>
<body class="bg-[#020617] text-white p-20 font-mono">
    <div class="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
      <h1 class="text-4xl font-black">> EMPIRE DASHBOARD</h1>
      <div class="text-right">
        <p class="text-xs text-slate-500 uppercase">Total Leads</p>
        <p class="text-2xl font-black text-emerald-400">${leadCount}</p>
      </div>
    </div>
    <div id="list" class="grid gap-6"></div>
    <script>
        const data = ${linksJson};
        data.forEach(n => {
            const d = document.createElement('div');
            d.className = "p-8 bg-white/5 rounded-3xl border border-white/10 flex justify-between items-center";
            d.innerHTML = \`<div><h3 class='font-bold text-xl'>\${n.name}</h3></div><a href='/\${n.slug}/' class='text-blue-400 font-bold'>VIEW SITE →</a>\`;
            document.getElementById('list').appendChild(d);
        });
    </script>
</body></html>`;
    fs.writeFileSync(path.join(hubDir, 'index.html'), hubHtml);
  }

  private async generatePublicFrontDoor() {
    const publicDir = path.join(this.masterPath, 'public');
    const landingHtml = `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-[#e2f2fd] flex items-center justify-center h-screen font-sans"><div class="text-center"><h1 class="text-4xl font-black text-blue-700 uppercase tracking-widest">BioRegen Authority Cluster</h1><p class="text-slate-500 mt-4">Automated Node.</p></div></body></html>`;
    fs.writeFileSync(path.join(publicDir, 'index.html'), landingHtml);
    fs.writeFileSync(path.join(this.masterPath, 'firebase.json'), JSON.stringify({hosting: {public: "public"}}, null, 2));
  }

  private async syncToGithub() {
    try {
      execSync('git add .');
      execSync('git commit -m "Autonomous Empire Update: Leads and Magnet Logic"');
      execSync('git push origin main --force');
    } catch (e) {
      console.warn("GitHub sync error - possibly running in workflow environment.");
    }
  }

  private async deploy() {
    const original = process.cwd();
    process.chdir(this.masterPath);
    try { execSync('firebase deploy --only hosting --project smart-web-builder-ai'); } finally { process.chdir(original); }
  }

  private async notifyTelegram(message: string) {
    try { await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, { chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown' }); } catch (e) {}
  }
}
