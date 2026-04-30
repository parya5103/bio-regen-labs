import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { Firestore, doc, docData, setDoc, collection, collectionData, query, orderBy, limit } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-10 bg-slate-950 min-h-screen text-white font-sans selection:bg-indigo-500 selection:text-white">
      <!-- HEADER -->
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
        <div class="space-y-1">
          <h1 class="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 via-white to-cyan-300">MASTER CONSOLE</h1>
          <div class="flex items-center gap-3">
             <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <p class="text-slate-500 font-bold tracking-[0.2em] uppercase text-[10px]">Secure Personal Node • Encrypted</p>
          </div>
        </div>
        <button 
          (click)="forceDeploy()"
          [disabled]="isDeploying()"
          class="group relative px-10 py-5 bg-white text-black rounded-2xl font-black text-sm tracking-widest hover:scale-105 transition-all active:scale-95 disabled:opacity-50">
          <span class="relative z-10">{{ isDeploying() ? 'INITIALIZING...' : 'FORCE NEW CYCLE' }}</span>
          <div class="absolute inset-0 bg-indigo-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
        </button>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <!-- LIVE STATUS -->
        <div class="lg:col-span-2 space-y-10">
          <div class="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl relative">
            @if (status$ | async; as status) {
              <div class="flex flex-col md:flex-row justify-between gap-12">
                <div class="space-y-6">
                  <span class="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black tracking-widest rounded-full border border-indigo-500/20 uppercase">Live Site Architecture</span>
                  <h3 class="text-7xl font-bold tracking-tighter leading-none">{{ status.niche }}</h3>
                  <div class="flex items-center gap-6">
                    <a [href]="status.url" target="_blank" class="text-indigo-400 font-black text-sm hover:underline tracking-tight flex items-center gap-2">
                       LAUNCH REPOSITORY
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </a>
                    <span class="text-slate-600 font-mono text-xs uppercase tracking-widest">Active Theme: {{ status.themeColor }}</span>
                  </div>
                </div>
                <div class="flex flex-col justify-end text-right">
                   <p class="text-slate-500 text-[10px] font-black uppercase mb-1">Last Heartbeat</p>
                   <p class="text-xl font-mono text-white">{{ status.lastUpdated?.toDate() | date:'HH:mm:ss' }}</p>
                </div>
              </div>
            }
          </div>

          <!-- RECENT ACTIVITY LOGS -->
          <div class="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-12">
            <h4 class="text-xs font-black tracking-widest text-slate-500 uppercase mb-8">Intelligence Log</h4>
            <div class="space-y-4">
              @for (log of (logs$ | async); track log.timestamp) {
                <div class="flex items-start gap-6 p-4 rounded-2xl hover:bg-white/5 transition group">
                   <span class="text-slate-600 font-mono text-[10px] pt-1 uppercase whitespace-nowrap">{{ log.timestamp?.toDate() | date:'shortTime' }}</span>
                   <div>
                     <p class="text-slate-300 font-bold text-sm tracking-tight group-hover:text-white transition">{{ log.message }}</p>
                     <p class="text-slate-600 text-[9px] font-black uppercase tracking-widest mt-1">{{ log.step }}</p>
                   </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- SIDEBAR INFO -->
        <div class="space-y-10">
           <div class="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
              <div class="relative z-10">
                <h4 class="text-white/60 text-[10px] font-black uppercase tracking-widest mb-6">Revenue Cluster</h4>
                <p class="text-white text-xs font-medium mb-1">Active AdSense ID</p>
                <p class="text-2xl font-black text-white tracking-tighter">pub-2895136878543415</p>
                <div class="mt-10 pt-10 border-t border-white/10">
                  <p class="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">Network Health</p>
                  <p class="text-4xl font-black text-white">99.9%</p>
                </div>
              </div>
              <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500"></div>
           </div>

           <div class="bg-slate-900 border border-slate-800 rounded-[3rem] p-10">
              <h4 class="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">Historical Niches</h4>
              <div class="space-y-6">
                @for (history of (history$ | async); track history.timestamp) {
                  <div class="flex justify-between items-center">
                    <span class="text-sm font-bold text-slate-300">{{ history.niche }}</span>
                    <span class="text-[10px] font-mono text-slate-600 uppercase">{{ history.timestamp?.toDate() | date:'MMM d' }}</span>
                  </div>
                }
              </div>
           </div>
        </div>
      </div>
    </div>
  `
})
export class AdminPanelComponent implements OnInit {
  private firestore = inject(Firestore);
  status$: any;
  logs$: any;
  history$: any;
  isDeploying = signal(false);

  ngOnInit() {
    this.status$ = docData(doc(this.firestore, 'personal_sites', 'current'));
    
    this.logs$ = collectionData(
      query(collection(this.firestore, 'system_logs'), orderBy('timestamp', 'desc'), limit(5))
    );

    this.history$ = collectionData(
      query(collection(this.firestore, 'niche_history'), orderBy('timestamp', 'desc'), limit(5))
    );
  }

  async forceDeploy() {
    this.isDeploying.set(true);
    try {
      await setDoc(doc(this.firestore, 'personal_sites', 'trigger'), { 
        timestamp: new Date().toISOString(),
        action: 'FORCE_DEPLOY' 
      });
      setTimeout(() => this.isDeploying.set(false), 5000);
    } catch (e) {
      console.error(e);
      this.isDeploying.set(false);
    }
  }
}
