import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SquadsApiService, Squad } from '../../../core/services/squads-api.service';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { AppSettingsService } from '../../../core/services/app-settings.service';
import { PublicAthleteDetailsDrawerComponent } from '../components/public-athlete-details-drawer.component';

@Component({
  selector: 'app-public-squads-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, PublicAthleteDetailsDrawerComponent],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col">
      <!-- Hero Header -->
      <section class="relative h-[350px] flex items-center justify-center overflow-hidden bg-slate-900">
        <div class="absolute inset-0 opacity-40">
           <img src="assets/squad-hero-bg.jpg" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop'" />
        </div>
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/60 to-slate-900"></div>
        
        <div class="relative z-10 text-center px-4 max-w-4xl mx-auto">
          @if (squad()) {
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/30 backdrop-blur-md mb-4">
              <span class="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              <span class="text-[10px] font-black text-brand-400 uppercase tracking-widest">{{ squad()?.category }}</span>
            </div>
            <h1 class="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2">{{ squad()?.competition }}</h1>
            <p class="text-slate-300 text-lg md:text-xl font-medium tracking-tight">Temporada {{ squad()?.year }} • E.C. Pelotas</p>
          } @else if (!loading()) {
            <h1 class="text-4xl font-black text-white">Elenco não encontrado</h1>
          }
        </div>
      </section>

      <!-- Main Content -->
      <main class="flex-1 -mt-12 relative z-20 pb-20">
        <div class="max-w-7xl mx-auto px-4">
          
          <div class="flex flex-col lg:flex-row gap-8">
            <!-- Sidebar Filters -->
            <aside class="w-full lg:w-64 space-y-6">
              <div class="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                <h3 class="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Outros Elencos</h3>
                <div class="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  @for (h of historicalSquads(); track h._id) {
                    <button 
                      (click)="changeSquad(h)"
                      [class]="squad()?._id === h._id ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
                      class="w-full text-left p-3 rounded-2xl transition-all active:scale-95 flex flex-col"
                    >
                      <span class="text-xs font-black leading-none mb-1">{{ h.year }}</span>
                      <span class="text-[10px] opacity-80 font-bold truncate">{{ h.competition }}</span>
                    </button>
                  }
                </div>
              </div>

              <!-- Visual Call to Action (Stay connected) -->
              <div class="bg-indigo-900 rounded-3xl p-6 text-white overflow-hidden relative group font-sans">
                <div class="relative z-10">
                  <h4 class="font-black text-lg leading-tight mb-2">Seja Sócio do Lobo</h4>
                  <p class="text-[10px] text-indigo-200 font-medium mb-4">Apoie o Pelotas e tenha vantagens exclusivas.</p>
                  <a routerLink="/seja-socio" class="inline-flex items-center gap-2 bg-white text-indigo-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-50 transition-colors">
                    Saber Mais
                  </a>
                </div>
                <div class="absolute -right-4 -bottom-4 opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500 text-white">
                    @if (appSettings.badgeUrl()) {
                        <img [src]="appSettings.badgeUrl()" class="w-24 h-24 grayscale brightness-0 invert">
                    } @else {
                        <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.35C17.25 23.15 21 18.25 21 13V7L12 2Z"/></svg>
                    }
                </div>
              </div>
            </aside>

            <!-- Athlete Grid -->
            <div class="flex-1 space-y-12">
              @if (loading()) {
                <div class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <app-spinner />
                  <p class="text-slate-400 text-xs font-bold uppercase mt-4 tracking-widest">Carregando Elenco...</p>
                </div>
              } @else if (squad()) {
                @for (group of groupedMembers(); track group.position) {
                   <section class="space-y-6">
                     <div class="flex items-center gap-4">
                       <h2 class="text-xs font-black uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">{{ group.position }}</h2>
                       <div class="h-[1px] w-full bg-slate-100"></div>
                     </div>

                     <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                       @for (member of group.athletes; track member.athleteId) {
                        <div 
                          (click)="selectedAthlete.set(getAthlete(member))"
                          class="group relative bg-white rounded-3xl p-5 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all border border-slate-100 flex items-center gap-4 cursor-pointer"
                        >
                           <!-- Athlete Photo -->
                           <div class="relative shrink-0">
                             <div class="h-16 w-16 md:h-20 md:w-20 rounded-2xl overflow-hidden bg-slate-100 ring-4 ring-slate-50 group-hover:ring-brand-50 transition-all">
                                <img [src]="getAthlete(member).photoUrl || 'assets/placeholder-athlete.png'" 
                                     class="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                                     onerror="this.src='assets/placeholder-athlete.png'">
                             </div>
                             @if (member.number) {
                               <div class="absolute -top-2 -left-2 bg-brand-600 text-white w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shadow-lg">
                                 {{ member.number }}
                               </div>
                             }
                           </div>

                           <div class="flex-1 min-w-0">
                             <h3 class="text-base font-black text-slate-900 group-hover:text-brand-600 transition-colors truncate">
                               {{ getAthlete(member).nickname || getAthlete(member).name }}
                             </h3>
                             <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate mb-2">
                               {{ getAthlete(member).name }}
                             </p>
                             
                             @if (member.role) {
                               <span class="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[9px] font-black uppercase">
                                 {{ member.role }}
                               </span>
                             }
                           </div>

                           <!-- Decorative background SVG (Club Badge on Hover) -->
                           <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-15 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-12">
                              @if (appSettings.badgeUrl()) {
                                <img [src]="appSettings.badgeUrl()" class="w-12 h-12 grayscale brightness-0 opacity-40">
                              } @else {
                                <svg width="50" height="50" viewBox="0 0 24 24" fill="currentColor" class="text-slate-900"><path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.35C17.25 23.15 21 18.25 21 13V7L12 2Z"/></svg>
                              }
                           </div>
                         </div>
                       }
                     </div>
                   </section>
                }
              } @else {
                <div class="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
                   <p class="text-slate-400 font-medium">Nenhum elenco disponível para esta seleção.</p>
                </div>
              }
            </div>
          </div>
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
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
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
    // 1. Load all squads for the sidebar
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
    // Find detailed (populated members)
    this.squadsApi.findOne(id).subscribe({
      next: (res: any) => {
        this.squad.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
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

      // Find first matching position
      const pos = athlete.positions?.[0] || '';
      let groupName = 'Comissão Técnica'; // Default fallback for non-athletes
      
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
