import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Idol } from '../../../core/models/idol.model';
import { IdolsApiService } from '../../../core/services/idols-api.service';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { FallbackImgDirective } from '../../../shared/directives/fallback-img.directive';
import { animate, style, transition, trigger } from '@angular/animations';


@Component({
  selector: 'app-public-idols-page',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, FallbackImgDirective],
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
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 font-sans selection:bg-amber-400 selection:text-slate-900 pb-32">
      
      <!-- HERO HEADER -->
      <section class="relative pt-24 pb-16 overflow-hidden">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
        <div class="max-w-7xl mx-auto px-4 relative z-10">
          <div class="flex flex-col items-center text-center space-y-6">
            <div class="flex items-center gap-3 animate-in fade-in slide-in-from-top duration-700">
               <div class="w-2 h-10 bg-amber-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)]"></div>
               <h1 class="text-4xl sm:text-7xl font-black text-white tracking-tighter uppercase italic">
                 Galeria de <span class="text-amber-400">Ídolos</span>
               </h1>
            </div>
            <p class="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-8 animate-in fade-in slide-in-from-bottom duration-700 delay-100 italic">
              Imortalizando as lendas que honraram o manto Áureo-Cerúleo
            </p>

            <!-- SEARCH BAR -->
             <div class="w-full max-w-xl relative group animate-in zoom-in duration-500 delay-200">
                <div class="absolute -inset-1 bg-gradient-to-r from-amber-400/20 to-sky-400/20 rounded-2xl blur opacity-25 group-focus-within:opacity-100 transition duration-500"></div>
                <div class="relative flex items-center">
                   <div class="absolute left-5 text-amber-400/50 group-focus-within:text-amber-400 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                   </div>
                   <input 
                      type="text" 
                      [value]="searchQuery()"
                      (input)="onSearch($event)"
                      placeholder="Procurar um ídolo imortal..."
                      class="w-full bg-white/5 backdrop-blur-xl border border-white/10 text-white placeholder:text-white/20 px-14 py-4 rounded-2xl outline-none focus:border-amber-400/50 transition-all font-bold text-sm tracking-wide"
                   />
                   @if (searchQuery()) {
                      <button (click)="clearSearch()" class="absolute right-5 text-white/30 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                   }
                </div>
             </div>
          </div>
        </div>
      </section>

      <!-- GRID SECTION -->
      <main class="max-w-7xl mx-auto px-4 relative z-20">
        
        @if (loading()) {
          <div class="py-32 flex flex-col items-center justify-center">
            <app-spinner size="lg"></app-spinner>
            <p class="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Convocando as Lendas...</p>
          </div>
        } @else if (filteredIdols().length === 0) {
          <div class="py-32 flex flex-col items-center justify-center text-center space-y-6 opacity-30">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <div>
              <p class="text-xl font-black text-white uppercase italic">Nenhuma lenda encontrada</p>
              <p class="text-xs font-bold text-slate-400 mt-2 italic">A história ainda reserva um lugar para quem busca</p>
            </div>
            @if (searchQuery()) {
              <button (click)="clearSearch()" class="text-amber-400 text-xs font-black uppercase tracking-widest border-b border-amber-400/20 pb-1">Limpar busca</button>
            }
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (idol of filteredIdols(); track idol._id; let i = $index) {
              <article 
                @fadeInUp
                [style.animation-delay]="(i * 100) + 'ms'"
                (click)="openModal(idol)"
                class="group bg-indigo-900/10 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden hover:border-amber-400/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col h-full cursor-pointer"
              >
                <!-- Photo Layered technique for no cropping -->
                <div class="aspect-[16/10] overflow-hidden relative bg-black/40">
                  <!-- Blurred Background -->
                  <img [src]="idol.photoUrl" appFallbackImg="cover" class="absolute inset-0 h-full w-full object-cover blur-2xl opacity-20 scale-125" />
                  
                  <!-- Main Image (Contained) -->
                  <img [src]="idol.photoUrl" appFallbackImg="cover" class="relative z-10 h-full w-full object-contain transition-transform duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0 shadow-2xl" />
                  
                  <div class="absolute inset-0 bg-gradient-to-t from-indigo-950 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity z-20"></div>
                  
                  <!-- Badge -->
                  <div class="absolute top-6 left-6 z-30">
                    @if (idol.isAthlete) {
                      <span class="px-3 py-1 bg-amber-400 text-indigo-950 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-xl flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="m11.5 12 .5-.5-.5-.5-.5.5.5.5zM20 12l.5-.5-.5-.5-.5.5.5.5zM4 12l.5-.5-.5-.5-.5.5.5.5zM12 20l.5-.5-.5-.5-.5.5.5.5zM12 4l.5-.5-.5-.5-.5.5.5.5z"/><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 7a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8.5a3.5 3.5 0 1 1 3.5-3.5 3.5 3.5 0 0 1-3.5 3.5z"/></svg>
                        Atleta
                      </span>
                    } @else if (idol.role) {
                      <span class="px-3 py-1 bg-white/10 backdrop-blur-md text-amber-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/5">
                        {{ idol.role }}
                      </span>
                    }
                  </div>
                </div>

                <!-- Text info -->
                <div class="p-8 flex flex-col flex-1 relative">
                  <h3 class="text-xl sm:text-2xl font-black text-white leading-tight mb-4 group-hover:text-amber-400 transition-colors uppercase italic tracking-tight">
                    {{ idol.name }}
                  </h3>

                  @if (idol.isAthlete) {
                    <div class="flex items-center gap-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">
                      <span class="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4M12 8v8"/></svg>
                        {{ idol.statistics?.goals || 0 }} Gols
                      </span>
                      <span class="w-1 h-1 bg-white/10 rounded-full"></span>
                      <span class="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                        {{ idol.statistics?.matches || 0 }} Jogos
                      </span>
                    </div>
                  }

                  <p class="text-slate-400 text-xs sm:text-sm font-bold leading-relaxed line-clamp-2 mb-8 opacity-60">
                    {{ idol.description }}
                  </p>

                  <div class="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                    <span class="text-[10px] font-black text-amber-400/40 uppercase tracking-widest group-hover:text-amber-400 transition-colors italic">Saber Tudo</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </div>
              </article>
            }
          </div>
        }
      </main>
    </div>

    <!-- DETAILS MODAL OVERLAY -->
    @if (selectedIdol()) {
      <div @fadeIn class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-950/95 backdrop-blur-md transition-opacity" (click)="closeModal()"></div>
        
        <!-- Modal Box -->
        <div class="relative w-full md:max-w-5xl md:h-[750px] bg-indigo-950/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row max-h-[95vh] md:max-h-[85vh]">
          
          <!-- Desktop Image Section (Hidden on Mobile) -->
          <div class="hidden md:block relative w-[40%] h-full bg-slate-950 overflow-hidden border-r border-white/5">
             <!-- Blurred Background -->
            <img [src]="selectedIdol()?.photoUrl" appFallbackImg="cover" class="absolute inset-0 w-full h-full object-cover blur-3xl opacity-20 scale-125" />
            <!-- Main Img (Contained) -->
            <img [src]="selectedIdol()?.photoUrl" appFallbackImg="cover" class="relative z-10 w-full h-full object-contain opacity-90 shadow-2xl" />
            
            <div class="absolute inset-0 bg-gradient-to-t from-indigo-950 via-transparent to-transparent opacity-80 z-20"></div>
            
            <div class="absolute bottom-12 left-10 right-10 z-30">
              <h2 class="text-4xl sm:text-6xl font-black text-white leading-none uppercase italic tracking-tighter drop-shadow-2xl">
                {{ selectedIdol()?.name }}
              </h2>
              @if (selectedIdol()?.role) {
                <p class="mt-4 text-amber-400 text-xs font-black uppercase tracking-[0.3em] italic">{{ selectedIdol()?.role }}</p>
              }
            </div>
          </div>
          
          <!-- Content Section -->
          <div class="flex-1 flex flex-col min-h-0 bg-indigo-950/20 relative">
            
            <!-- Mobile Header with Circle Image -->
            <div class="md:hidden flex flex-col items-center pt-10 pb-6 px-6 text-center animate-in fade-in slide-in-from-top duration-500">
               <div class="relative group">
                  <div class="absolute inset-0 bg-amber-400 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div class="relative w-36 h-36 rounded-full border-4 border-amber-400 shadow-[0_0_30px_rgba(250,204,21,0.2)] overflow-hidden mb-6 mx-auto">
                    <img [src]="selectedIdol()?.photoUrl" appFallbackImg="cover" class="w-full h-full object-cover object-top" />
                  </div>
               </div>
               <h2 class="text-3xl font-black text-white uppercase italic tracking-tighter leading-tight drop-shadow-lg">
                 {{ selectedIdol()?.name }}
               </h2>
               @if (selectedIdol()?.role) {
                  <p class="mt-2 text-amber-400 text-[10px] font-black uppercase tracking-[0.4em] italic">{{ selectedIdol()?.role }}</p>
               }
            </div>

            <!-- Absolute Close Button -->
            <div class="absolute top-8 right-8 z-20">
               <button (click)="closeModal()" class="w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-xl border border-white/10 md:border-white/5 rounded-full flex items-center justify-center text-white/50 hover:text-amber-400 hover:border-amber-400/30 transition-all duration-300 group">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="group-hover:rotate-90 transition-transform"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
               </button>
            </div>

            <!-- Scrollable Content Area -->
            <div class="p-8 md:p-12 overflow-y-auto custom-scrollbar flex-1 pb-20 overscroll-contain">
              @if (selectedIdol()?.isAthlete) {
                <!-- Stats Row -->
                <div class="grid grid-cols-2 gap-6 mb-12">
                  <div class="relative p-7 rounded-[2rem] bg-amber-400/5 border border-amber-400/10 overflow-hidden group hover:bg-amber-400/10 transition-colors">
                     <div class="absolute -right-4 -bottom-4 text-amber-400/5 group-hover:scale-110 transition-transform duration-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M12 2v20"/><path d="m17 7-5 5 5 5"/><path d="m7 7 5 5-5 5"/></svg>
                     </div>
                     <p class="text-[9px] font-black text-amber-400/40 uppercase tracking-[0.2em] mb-2 tracking-widest">Partidas</p>
                     <p class="text-4xl font-black text-amber-400 italic leading-none">{{ selectedIdol()?.statistics?.matches || 0 }}</p>
                  </div>
                  <div class="relative p-7 rounded-[2rem] bg-sky-400/5 border border-sky-400/10 overflow-hidden group hover:bg-sky-400/10 transition-colors">
                     <div class="absolute -right-4 -bottom-4 text-sky-400/5 group-hover:scale-110 transition-transform duration-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4M12 8v8"/></svg>
                     </div>
                     <p class="text-[9px] font-black text-sky-400/40 uppercase tracking-[0.2em] mb-2 tracking-widest">Gols Máximos</p>
                     <p class="text-4xl font-black text-sky-400 italic leading-none">{{ selectedIdol()?.statistics?.goals || 0 }}</p>
                  </div>
                </div>

                @if (selectedIdol()?.statistics?.titles?.length) {
                  <div class="mb-12">
                    <h4 class="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6 flex items-center gap-4 italic">
                       <span>Conquistas Imortais</span>
                       <div class="flex-1 h-px bg-white/5"></div>
                    </h4>
                    <div class="flex flex-wrap gap-3">
                      @for (title of selectedIdol()?.statistics?.titles; track $index) {
                        <span class="px-5 py-2.5 bg-white/5 border border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-wider text-slate-300 hover:text-white hover:border-amber-400/30 transition-all duration-300">
                          {{ title }}
                        </span>
                      }
                    </div>
                  </div>
                }
              }

              <div class="prose prose-invert max-w-none">
                 <h4 class="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6 flex items-center gap-4 italic">
                    <span>Biografia do Herói</span>
                    <div class="flex-1 h-px bg-white/5"></div>
                 </h4>
                 <div class="text-slate-300/80 text-sm sm:text-base font-bold leading-relaxed whitespace-pre-line italic">
                   {{ selectedIdol()?.description }}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

  `,
  styles: [`
    :host { display: block; }
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.02);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(251, 191, 36, 0.2);
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(251, 191, 36, 0.4);
    }
  `]
})
export class PublicIdolsPageComponent implements OnInit {
  private idolsApi = inject(IdolsApiService);

  readonly idols = signal<Idol[]>([]);
  readonly loading = signal(true);
  readonly selectedIdol = signal<Idol | null>(null);

  // Search Logic
  readonly searchQuery = signal('');
  readonly filteredIdols = computed(() => {
    const query = this.searchQuery().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (!query) return this.idols();
    
    return this.idols().filter(idol => {
      const normalizedName = idol.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalizedName.includes(query);
    });
  });

  ngOnInit() {
    this.idolsApi.listPublic().subscribe({
      next: (data: Idol[]) => {
        this.idols.set(data);
        this.loading.set(false);
      },
      error: (err: any) => this.loading.set(false)
    });
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  clearSearch() {
    this.searchQuery.set('');
  }

  openModal(idol: Idol) {
    this.selectedIdol.set(idol);
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.selectedIdol.set(null);
    document.body.style.overflow = '';
  }
}
