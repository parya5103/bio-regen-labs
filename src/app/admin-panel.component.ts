import { Component, signal, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { inject } from '@angular/core';
import { Firestore, doc, docData, setDoc, collection, collectionData, query, orderBy, limit, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  template: `
    <div class="p-4 md:p-10 bg-slate-950 min-h-screen text-white font-sans selection:bg-indigo-500 selection:text-white">
      <!-- HEADER -->
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div class="space-y-1">
          <h1 class="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 via-white to-cyan-300">SYSTEM CONTROL</h1>
          <div class="flex items-center gap-3">
             <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <p class="text-slate-500 font-bold tracking-[0.2em] uppercase text-[10px]">Autonomous Orchestrator v2.4 • Active</p>
          </div>
        </div>
        <div class="flex gap-4">
            <button 
                (click)="forceDeploy()"
                [disabled]="isDeploying()"
                class="group relative px-6 py-3 bg-white text-black rounded-xl font-black text-xs tracking-widest hover:scale-105 transition-all active:scale-95 disabled:opacity-50">
                <span class="relative z-10">{{ isDeploying() ? 'STARTING...' : 'TRIGGER NEW SITE' }}</span>
            </button>
            <button 
                (click)="toggleSystem()"
                [class]="systemEnabled() ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-green-500/20 text-green-400 border-green-500/50'"
                class="px-6 py-3 border rounded-xl font-black text-xs tracking-widest transition-all">
                {{ systemEnabled() ? 'PAUSE SYSTEM' : 'RESUME SYSTEM' }}
            </button>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- AGENT STATUS CARDS -->
        <div class="lg:col-span-2 space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div class="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Discovery Agent</p>
                <div class="flex justify-between items-end">
                    <h3 class="text-2xl font-bold text-indigo-300">ACTIVE</h3>
                    <span class="text-[10px] text-slate-600 font-mono">ID: AGENT_DISC_01</span>
                </div>
             </div>
             <div class="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Content Agent</p>
                <div class="flex justify-between items-end">
                    <h3 class="text-2xl font-bold text-cyan-300">WAITING</h3>
                    <span class="text-[10px] text-slate-600 font-mono">ID: AGENT_WRIT_04</span>
                </div>
             </div>
          </div>

          <!-- RECENT SITES -->
          <div class="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
            <h2 class="text-xl font-black mb-6 flex items-center gap-3">
                <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                GENERATED SITES
            </h2>
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-800">
                            <th class="pb-4">Niche</th>
                            <th class="pb-4">Status</th>
                            <th class="pb-4">Deployed</th>
                            <th class="pb-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/50">
                        @for (site of (history$ | async) || []; track site.id) {
                            <tr class="group hover:bg-white/[0.02] transition">
                                <td class="py-4 font-bold text-sm">{{ site.niche }}</td>
                                <td class="py-4">
                                    <span class="px-2 py-1 bg-green-500/10 text-green-400 text-[9px] font-black rounded uppercase">Live</span>
                                </td>
                                <td class="py-4 text-xs font-mono text-slate-500">{{ site.timestamp?.toDate() | date:'MMM d, HH:mm' }}</td>
                                <td class="py-4 text-right">
                                    <button (click)="deleteSite(site.id)" class="text-slate-600 hover:text-red-400 transition">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
          </div>

          <!-- LIVE LOGS -->
          <div class="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8">
            <div class="flex justify-between items-center mb-6">
                <h4 class="text-xs font-black tracking-widest text-slate-500 uppercase">Intelligence Stream</h4>
                <button (click)="clearLogs()" class="text-[10px] font-black text-slate-600 hover:text-white transition uppercase">Clear Console</button>
            </div>
            <div class="space-y-3 font-mono text-xs">
              @for (log of (logs$ | async) || []; track log.timestamp) {
                <div class="flex gap-4 p-2 rounded hover:bg-white/5 transition group">
                   <span class="text-slate-600 shrink-0">[{{ log.timestamp?.toDate() | date:'HH:mm:ss' }}]</span>
                   <span class="text-indigo-400 shrink-0">{{ log.step }}:</span>
                   <span class="text-slate-300">{{ log.message }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- SIDEBAR -->
        <div class="space-y-8">
           <!-- SYSTEM HEALTH -->
           <div class="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 shadow-2xl">
                <h4 class="text-white/60 text-[10px] font-black uppercase tracking-widest mb-6">Environment Health</h4>
                <div class="space-y-6">
                    <div>
                        <div class="flex justify-between text-[10px] font-black mb-2 uppercase">
                            <span>API Quota</span>
                            <span>84%</span>
                        </div>
                        <div class="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                            <div class="h-full bg-white w-[84%]"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-[10px] font-black mb-2 uppercase">
                            <span>Storage</span>
                            <span>12%</span>
                        </div>
                        <div class="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                            <div class="h-full bg-white w-[12%]"></div>
                        </div>
                    </div>
                </div>
           </div>

           <!-- SETTINGS -->
           <div class="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8">
              <h4 class="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">Orchestrator Settings</h4>
              <div class="space-y-4">
                  <div class="flex justify-between items-center">
                      <span class="text-xs font-bold text-slate-300">Auto-Research</span>
                      <div class="w-8 h-4 bg-indigo-500 rounded-full relative"><div class="absolute right-1 top-1 w-2 h-2 bg-white rounded-full"></div></div>
                  </div>
                  <div class="flex justify-between items-center">
                      <span class="text-xs font-bold text-slate-300">Deep Write (1500w)</span>
                      <div class="w-8 h-4 bg-indigo-500 rounded-full relative"><div class="absolute right-1 top-1 w-2 h-2 bg-white rounded-full"></div></div>
                  </div>
                  <div class="flex justify-between items-center">
                      <span class="text-xs font-bold text-slate-400">Image Generation</span>
                      <div class="w-8 h-4 bg-slate-700 rounded-full relative"><div class="absolute left-1 top-1 w-2 h-2 bg-slate-500 rounded-full"></div></div>
                  </div>
              </div>
              <div class="mt-8 pt-8 border-t border-slate-800">
                  <p class="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Master AdSense</p>
                  <code class="text-[10px] text-indigo-400 font-mono">pub-2895136878543415</code>
              </div>
           </div>
        </div>
      </div>
    </div>
  `
})
export class AdminPanelComponent implements OnInit {
  private firestore = inject(Firestore);
  logs$: any;
  history$: any;
  isDeploying = signal(false);
  systemEnabled = signal(true);

  ngOnInit() {
    this.logs$ = collectionData(
      query(collection(this.firestore, 'system_logs'), orderBy('timestamp', 'desc'), limit(15))
    );

    this.history$ = collectionData(
      query(collection(this.firestore, 'niche_history'), orderBy('timestamp', 'desc'), limit(10)),
      { idField: 'id' }
    );
  }

  async forceDeploy() {
    this.isDeploying.set(true);
    try {
      await setDoc(doc(this.firestore, 'personal_sites', 'trigger'), { 
        timestamp: new Date().toISOString(),
        action: 'FORCE_DEPLOY',
        source: 'ADMIN_CONSOLE'
      });
      // Simulate build start
      setTimeout(() => this.isDeploying.set(false), 3000);
    } catch (e) {
      console.error(e);
      this.isDeploying.set(false);
    }
  }

  toggleSystem() {
    this.systemEnabled.set(!this.systemEnabled());
  }

  async deleteSite(id: string) {
    if (confirm('Are you sure you want to remove this site record?')) {
      await deleteDoc(doc(this.firestore, 'niche_history', id));
    }
  }

  async clearLogs() {
    // Note: In a real app, you'd call a cloud function to batch delete
    alert('Log clearing requires higher-level authorization.');
  }
}
