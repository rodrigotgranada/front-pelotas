import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Athlete } from '../../../core/services/athletes-api.service';
import { AppSettingsService } from '../../../core/services/app-settings.service';

@Component({
  selector: 'app-public-athlete-details-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (athlete) {
      <div class="fixed inset-0 z-[100] overflow-hidden flex justify-end">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" (click)="onClose()"></div>
        
        <!-- Drawer Panel -->
        <div class="relative w-full max-w-lg bg-gradient-to-br from-[#004587]/90 via-[#003566]/95 to-[#FFCC00]/20 backdrop-blur-xl shadow-2xl flex flex-col transform transition-transform duration-500 animate-in slide-in-from-right font-sans border-l border-white/10">
          
          <!-- Header Branding -->
          <div class="relative h-32 shrink-0 flex items-center justify-center">
             <!-- Abstract background patterns -->
             <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0); background-size: 20px 20px;"></div>
             
             <!-- Close button -->
             <button (click)="onClose()" class="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all z-30">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
             </button>

             <!-- Club Badge (Top Left, Tilted like a Label) -->
             @if (appSettings.badgeUrl()) {
                <div class="absolute top-4 left-4 z-40">
                   <div class="relative group">
                      <div class="absolute -inset-2 bg-yellow-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <img [src]="appSettings.badgeUrl()" 
                           class="w-14 h-14 drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)] transform -rotate-[15deg] transition-transform hover:scale-110 hover:-rotate-0 cursor-default">
                   </div>
                </div>
             }
          </div>

          <!-- Circular Photo Section -->
          <div class="relative px-8 -mt-16 z-20 flex justify-center">
             <div class="h-44 w-44 rounded-full border-[6px] border-white/20 shadow-2xl overflow-hidden bg-white/5 backdrop-blur-md ring-1 ring-white/30">
                <img [src]="athlete.photoUrl || 'assets/placeholder-athlete.png'" 
                     class="w-full h-full object-cover" 
                     onerror="this.src='assets/placeholder-athlete.png'">
             </div>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto px-8 pb-12 pt-6 relative z-10 custom-scrollbar">
            <!-- Name Card -->
            <div class="mb-8 text-center">
              <h2 class="text-3xl font-black text-white tracking-tighter leading-none mb-1 drop-shadow-sm">{{ athlete.nickname || athlete.name }}</h2>
              <p class="text-[10px] font-bold text-yellow-400 uppercase tracking-[0.2em] mb-4 opacity-90">{{ athlete.name }}</p>
              
              <div class="flex flex-wrap gap-2 justify-center">
                @for (pos of athlete.positions; track pos) {
                  <span class="px-3 py-1 bg-white/10 text-white text-[10px] font-black uppercase rounded-lg border border-white/20 backdrop-blur-md shadow-sm">{{ pos }}</span>
                }
              </div>
            </div>

            <!-- Bio Stats Grid (Glassmorphism) -->
            <div class="grid grid-cols-2 gap-4 mb-10">
              <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-sm">
                <p class="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Nascimento</p>
                <p class="text-sm font-black text-white">{{ formatDate(athlete.dateOfBirth) }}</p>
              </div>
              <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-sm">
                <p class="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Altura</p>
                <p class="text-lg font-black text-white">{{ athlete.height || '--' }} <span class="text-[10px] font-bold text-white/40 ml-1">cm</span></p>
              </div>
              <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-sm">
                <p class="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Pé Preferencial</p>
                <p class="text-lg font-black text-white">{{ athlete.preferredFoot || '--' }}</p>
              </div>
              <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-sm">
                <p class="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Naturalidade</p>
                <p class="text-xs font-bold text-white truncate" [title]="athlete.hometown">{{ athlete.hometown || '--' }}</p>
              </div>
            </div>

            <!-- Previous Clubs Section -->
            @if (athlete.previousClubs && athlete.previousClubs.length > 0) {
              <section class="space-y-4">
                <h3 class="text-[10px] font-black text-yellow-400/70 uppercase tracking-[0.2em] flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.91A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.79 1.09L21 9"/></svg>
                  Clubes Anteriores
                </h3>
                
                <div class="space-y-2">
                   @for (club of athlete.previousClubs; track $index) {
                     <div class="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                       <div class="flex items-center gap-3">
                         <div class="w-2 h-2 rounded-full bg-yellow-400 group-hover:scale-125 transition-transform shadow-[0_0_8px_rgba(255,255,0,0.5)]"></div>
                         <p class="text-sm font-bold text-white">{{ club.club }}</p>
                       </div>
                       <p class="text-[10px] font-black text-white/50 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                         {{ club.yearStart }}{{ club.yearEnd ? ' - ' + club.yearEnd : '' }}
                       </p>
                     </div>
                   }
                </div>
              </section>
            }

            <!-- Institutional Footer inside Drawer -->
            <div class="mt-12 pt-8 border-t border-white/10 text-center">
               <p class="text-[10px] text-yellow-400 font-bold uppercase tracking-[0.3em] mb-1 opacity-60">E.C. Pelotas</p>
               <p class="text-[9px] text-white/40 font-medium italic">Sempre Lobão, com orgulho e tradição.</p>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    
    @keyframes slide-in-right {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    .animate-in.slide-in-from-right {
      animation: slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
  `]
})
export class PublicAthleteDetailsDrawerComponent {
  @Input() athlete: any | null = null;
  @Output() close = new EventEmitter<void>();

  protected readonly appSettings = inject(AppSettingsService);

  onClose(): void {
    this.close.emit();
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return '--/--/----';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
