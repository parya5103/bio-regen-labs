/**
 * Autonomous Orchestrator - Real-time Firestore Sync
 */

import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
if (admin.apps.length === 0) {
    admin.initializeApp({
        projectId: "smart-web-builder-ai"
    });
}

const db = admin.firestore();
const API_KEY = "AIzaSyBHIwAYcYXKsoMjiL5gARmfL6cLO7o_040";
const genAI = new GoogleGenerativeAI(API_KEY);

export class AutonomousManager {
  private projectPath = path.join(process.cwd(), 'bio-regen-labs-site');
  private isRunning = false;

  constructor() {
    console.log("🛰️ Orchestrator: Listening for Admin Commands...");
    this.listenForCommands();
  }

  private listenForCommands() {
    db.collection('personal_sites').doc('trigger').onSnapshot(async (snap) => {
      const data = snap.data();
      if (data && data['action'] === 'FORCE_DEPLOY' && !this.isRunning) {
        console.log("⚡ Command Received: FORCE_DEPLOY");
        await this.runFullLoop();
        await snap.ref.update({ action: 'COMPLETED', completedAt: admin.firestore.FieldValue.serverTimestamp() });
      }
    });
  }

  private async log(step: string, message: string) {
      console.log(`[${step}] ${message}`);
      await db.collection('system_logs').add({
          step,
          message,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
  }

  async runFullLoop() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    await this.log("SYSTEM", "Starting full autonomous cycle...");

    let niche = "";
    try {
      await this.log("DISCOVERY", "Researching trending niches...");
      niche = await this.discoverNiche();
      await this.log("DISCOVERY", `Target niche identified: ${niche}`);
    } catch (e) {
      await this.log("DISCOVERY", "API Blocked. Using fallback niche.");
      niche = "AI-Driven Personalized Nootropics";
    }

    await this.log("ARCHITECTURE", `Building site structure for ${niche}...`);
    await this.generateSiteStructure(niche);

    try {
      await this.log("CONTENT", "Generating SEO optimized expert content...");
      await this.injectContent(niche);
    } catch (e) {
      await this.log("CONTENT", "Generation failed. Injecting placeholder.");
      this.injectPlaceholderContent(niche);
    }

    await db.collection('niche_history').add({
        niche,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'LIVE'
    });

    await this.log("DEPLOYMENT", "Pushing to Firebase Hosting...");
    await this.firebaseDeployAgent();

    await this.log("SYSTEM", "Cycle completed successfully. System standby.");
    this.isRunning = false;
  }

  private async discoverNiche() {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = "Choose one high-potential trending niche for an AI-generated healthcare blog. Return ONLY the niche name.";
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  }

  private async generateSiteStructure(niche: string) {
    if (!fs.existsSync(this.projectPath)) fs.mkdirSync(this.projectPath, { recursive: true });
    const publicDir = path.join(this.projectPath, 'public');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    
    const indexHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${niche}</title><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-slate-50"><nav class="p-6 bg-white border-b"><h1>${niche}</h1></nav><main class="p-10"><!-- Content --></main></body></html>`;
    fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtml);
  }

  private async injectContent(niche: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Write a 500-word expert article about ${niche}. Return only the HTML body.`;
    const result = await model.generateContent(prompt);
    const content = result.response.text();
    
    const indexFile = path.join(this.projectPath, 'public', 'index.html');
    let indexHtml = fs.readFileSync(indexFile, 'utf8');
    indexHtml = indexHtml.replace('<!-- Content -->', content);
    fs.writeFileSync(indexFile, indexHtml);
  }

  private injectPlaceholderContent(niche: string) {
    const indexFile = path.join(this.projectPath, 'public', 'index.html');
    let indexHtml = fs.readFileSync(indexFile, 'utf8');
    indexHtml = indexHtml.replace('<!-- Content -->', `<p>Coming soon: ${niche}</p>`);
    fs.writeFileSync(indexFile, indexHtml);
  }

  private async firebaseDeployAgent() {
    try {
      const originalCwd = process.cwd();
      process.chdir(this.projectPath);
      execSync('firebase deploy --only hosting --project smart-web-builder-ai');
      process.chdir(originalCwd);
    } catch (e) {
      console.error("Deploy error:", e);
    }
  }
}
