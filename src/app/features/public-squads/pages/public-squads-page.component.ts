import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SquadsApiService, Squad } from '../../../core/services/squads-api.service';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { AppSettingsService } from '../../../core/services/app-settings.service';
import { PublicAthleteDetailsDrawerComponent } from '../components/public-athlete-details-drawer.component';
import { animate, style, transition, trigger } from '@angular/animations';


@Component({
  selector: 'app-public-squads-page',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, PublicAthleteDetailsDrawerComponent],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 font-sans selection:bg-amber-400 selection:text-slate-900 pb-32">
      
      <!-- HERO HEADER (Only Desktop) -->
      <section class="hidden md:flex relative h-[350px] items-center justify-center overflow-hidden">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none z-10"></div>
        <div class="absolute inset-0 z-0">
           <img src="assets/squad-hero-bg.jpg" class="w-full h-full object-cover grayscale opacity-30 scale-110" onerror="this.src='https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop'" />
        </div>
        <div class="absolute inset-0 bg-gradient-to-b from-indigo-950/80 via-transparent to-indigo-950 z-10"></div>
        
        <div class="relative z-20 text-center px-4 max-w-4xl mx-auto">
          @if (squad()) {
            <div class="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-amber-400/10 backdrop-blur-xl border border-amber-400/20 mb-6 animate-in fade-in slide-in-from-bottom duration-700">
               <div class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
               <span class="text-amber-400 text-[10px] font-black uppercase tracking-[0.4em] italic">{{ squad()?.category }}</span>
            </div>
            <h1 class="text-6xl font-black text-white tracking-tighter mb-2 italic uppercase">{{ squad()?.competition }}</h1>
            <p class="text-slate-400 text-xl font-bold italic tracking-tight opacity-60">Temporada {{ squad()?.year }} • E.C. Pelotas</p>
          }
        </div>
      </section>

      <!-- MAIN CONTENT AREA -->
      <main class="max-w-7xl mx-auto px-4 pt-12 md:pt-0 relative z-20">
        
        <!-- TOP SELECTOR & TITLE -->
        <header class="flex flex-col md:flex-row items-center justify-between gap-6 mb-16 md:-mt-10">
           <div class="flex items-center gap-4 animate-in fade-in slide-in-from-left duration-700">
              <div class="w-2 h-10 bg-amber-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)]"></div>
              <h2 class="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
                O <span class="text-amber-400">Plantel</span>
              </h2>
           </div>

           <!-- LOBO GLASS SELECTOR -->
           <div class="w-full md:w-auto relative group animate-in slide-in-from-right duration-700">
              <div class="absolute -inset-1 bg-gradient-to-r from-amber-400/20 to-sky-400/20 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-500"></div>
              <div class="relative flex items-center">
                 <select 
                   (change)="onSelectChange($event)"
                   class="w-full md:w-[350px] bg-indigo-900/40 backdrop-blur-3xl border border-white/10 text-white font-black text-sm uppercase tracking-widest px-6 py-4 rounded-2xl outline-none focus:border-amber-400/50 appearance-none cursor-pointer transition-all"
                 >
                   @for (h of historicalSquads(); track h._id) {
                     <option [value]="h._id" [selected]="squad()?._id === h._id" class="bg-indigo-950 text-white font-black">
                       {{ h.year }} • {{ h.competition }}
                     </option>
                   }
                 </select>
                 <div class="absolute right-6 pointer-events-none text-amber-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                 </div>
              </div>
           </div>
        </header>

        <!-- ATHLETE GRID SECTION -->
        <div class="space-y-24">
          @if (loading()) {
            <div class="py-32 flex flex-col items-center justify-center">
              <app-spinner size="lg"></app-spinner>
              <p class="mt-6 text-slate-500 font-black uppercase tracking-widest text-xs italic">Escalando o time...</p>
            </div>
          } @else if (squad()) {
            @for (group of groupedMembers(); track group.position; let i = $index) {
               <section @fadeInUp [style.animation-delay]="(i * 150) + 'ms'" class="space-y-10">
                 <!-- Position Header -->
                 <div class="flex items-center gap-6">
                    <h3 class="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white/30 whitespace-nowrap italic">
                      {{ group.position }}
                    </h3>
                    <div class="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent"></div>
                 </div>

                 <!-- Grid -->
                 <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                   @for (member of group.athletes; track member.athleteId) {
                    <div 
                      (click)="selectedAthlete.set(getAthlete(member))"
                      class="group relative bg-indigo-900/10 backdrop-blur-xl border border-white/5 rounded-3xl p-6 hover:border-amber-400/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center gap-6 cursor-pointer overflow-hidden"
                    >
                       <!-- Athlete Photo Layer -->
                       <div class="relative shrink-0 z-10">
                         <div class="h-20 w-20 md:h-24 md:w-24 rounded-2xl overflow-hidden bg-slate-950/40 border border-white/5 ring-4 ring-white/0 group-hover:ring-amber-400/20 transition-all duration-700">
                            <img [src]="getAthlete(member).photoUrl || 'assets/placeholder-athlete.png'" 
                                 class="h-full w-full object-cover transition duration-1000 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0"
                                 onerror="this.src='assets/placeholder-athlete.png'">
                         </div>
                         @if (member.number) {
                           <div class="absolute -top-2 -left-2 bg-amber-400 text-indigo-950 w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black shadow-lg shadow-amber-400/20 italic">
                             {{ member.number }}
                           </div>
                         }
                       </div>

                       <!-- Athlete Info Layer -->
                       <div class="flex-1 min-w-0 z-10">
                         <h4 class="text-xl font-black text-white group-hover:text-amber-400 transition-colors truncate uppercase italic tracking-tighter">
                           {{ getAthlete(member).nickname || getAthlete(member).name }}
                         </h4>
                         <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate mb-3 italic opacity-60">
                           {{ getAthlete(member).name }}
                         </p>
                         
                         @if (member.role) {
                           <span class="inline-block px-3 py-1 rounded-lg bg-white/5 text-white/40 text-[9px] font-black uppercase tracking-widest border border-white/5 italic group-hover:text-amber-400/60 transition-colors">
                             {{ member.role }}
                           </span>
                         }
                       </div>

                       <!-- Decorative Badges Overlay -->
                       <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-5 transition-all duration-700 transform group-hover:-scale-x-110 group-hover:rotate-12 pointer-events-none">
                          @if (appSettings.badgeUrl()) {
                            <img [src]="appSettings.badgeUrl()" class="w-16 h-16 grayscale brightness-0 invert">
                          }
                       </div>
                     </div>
                   }
                 </div>
               </section>
            }
          } @else {
            <div @fadeIn class="py-32 text-center bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/5">
                <p class="text-white/40 font-black text-lg uppercase tracking-widest italic">Nenhum guerreiro escalado para este elenco.</p>
            </div>
          }
        </div>
      </main>

      <!-- Athlete Details Drawer -->
      <app-public-athlete-details-drawer 
        [athlete]="selectedAthlete()" 
        (close)="selectedAthlete.set(null)" 
      />
    </div>
  `,
  styles: [`
    :host { display: block; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.1); border-radius: 10px; }
  `]
})
export class PublicSquadsPageComponent implements OnInit {
  private readonly squadsApi = inject(SquadsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly appSettings = inject(AppSettingsService);

  readonly squad = signal<Squad | null>(null);
  readonly historicalSquads = signal<Squad[]>([]);
  readonly loading = signal(true);
  readonly selectedAthlete = signal<any | null>(null);

  ngOnInit(): void {
    // 1. Load all squads for the selector
    this.squadsApi.findAll({ limit: 100, sort: '-year' }).subscribe({
      next: (all: Squad[]) => {
        this.historicalSquads.set(all);
        
        // 2. Check route params
        this.route.paramMap.subscribe(params => {
          const year = params.get('year');
          const comp = params.get('competition');

          if (year && comp) {
            const found = all.find((s: any) => s.year === +year && s.competition === comp);
            if (found) {
                this.loadFullSquad(found._id);
            } else {
                this.loading.set(false);
            }
          } else if (all.length > 0) {
            // Default to latest
            this.loadFullSquad(all[0]._id);
          } else {
            this.loading.set(false);
          }
        });
      },
      error: () => this.loading.set(false)
    });
  }

  loadFullSquad(id: string): void {
    this.loading.set(true);
    this.squadsApi.findOne(id).subscribe({
      next: (res: any) => {
        this.squad.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const squadId = select.value;
    const found = this.historicalSquads().find(h => h._id === squadId);
    if (found) {
      this.changeSquad(found);
    }
  }

  changeSquad(s: Squad): void {
    this.router.navigate(['/elenco', s.year, s.competition]);
  }

  getAthlete(member: any): any {
    return member.athleteId || {};
  }

  groupedMembers(): { position: string, athletes: any[] }[] {
    const s = this.squad();
    if (!s) return [];

    const groups: { [key: string]: any[] } = {};

    s.members.forEach((m: any) => {
      const athlete = this.getAthlete(m);
      if (athlete.isStaff) {
         groups['Comissão Técnica'] = [...(groups['Comissão Técnica'] || []), m];
         return;
      }

      const pos = athlete.positions?.[0] || '';
      let groupName = 'Comissão Técnica'; 
      
      if (pos.includes('Goleiro')) groupName = 'Goleiros';
      else if (pos.includes('Lateral') || pos.includes('Zagueiro')) groupName = 'Defensores';
      else if (pos.includes('Volante') || pos.includes('Meia')) groupName = 'Meio-Campo';
      else if (pos.includes('Ponta') || pos.includes('Atacante')) groupName = 'Atacantes';
      else if (pos.includes('Treinador') || pos.includes('Técnico') || pos.includes('Prep') || pos.includes('Médico') || pos.includes('Fisioterapeuta')) groupName = 'Comissão Técnica';

      groups[groupName] = [...(groups[groupName] || []), m];
    });

    const displayOrder = ['Goleiros', 'Defensores', 'Meio-Campo', 'Atacantes', 'Comissão Técnica'];
    
    return displayOrder
      .filter(name => groups[name] && groups[name].length > 0)
      .map(name => ({
        position: name,
        athletes: groups[name]
      }));
  }
}
