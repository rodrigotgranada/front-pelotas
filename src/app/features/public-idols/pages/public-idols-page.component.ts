import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
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
    <div class="bg-slate-50 font-sans selection:bg-amber-300 selection:text-slate-900 pb-20">
      
      <!-- HERO HEADER -->
      <div class="relative overflow-hidden bg-slate-900 py-24 sm:py-32">
        <div class="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1518605368461-1ee12523dc70?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" alt="Estádio" class="h-full w-full object-cover origin-center opacity-20 grayscale mix-blend-multiply" />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        </div>
        
        <div class="relative mx-auto max-w-7xl px-6 lg:px-8 text-center z-10 flex flex-col items-center">
          <h1 class="text-4xl font-black tracking-tight text-white sm:text-6xl drop-shadow-md">
            Mural de <span class="text-amber-400">Ídolos</span>
          </h1>
          <p class="mt-6 text-lg leading-8 text-slate-300 max-w-2xl text-balance drop-shadow">
            Conheça as lendas, os heróis e os nomes que cravaram sua história do Esporte Clube Pelotas.
          </p>
        </div>
      </div>

      <!-- GRID SECTION -->
      <main class="mx-auto max-w-7xl px-6 lg:px-8 -mt-10 relative z-20">
        
        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-xl ring-1 ring-slate-200/50">
            <app-spinner size="lg" color="amber" />
            <p class="mt-4 text-slate-500 font-medium">Buscando as lendas...</p>
          </div>
        } @else if (idols().length === 0) {
          <div class="flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-xl ring-1 ring-slate-200/50 text-center px-6">
            <div class="rounded-full bg-slate-50 p-6 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <h3 class="text-xl font-bold text-slate-900">Mural em Construção</h3>
            <p class="mt-2 text-slate-500 max-w-sm text-balance">Em breve a diretoria adicionará a biografia dos nossos grandes heróis.</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
            @for (idol of idols(); track idol._id; let i = $index) {
              <article 
                @fadeInUp
                [style.animation-delay]="(i * 50) + 'ms'"
                (click)="openModal(idol)"
                class="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-900/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <!-- Photo always visible -->
                <div class="relative h-64 overflow-hidden bg-slate-100">
                  <img [src]="idol.photoUrl" appFallbackImg="cover" class="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                  <!-- Badge: athlete or role -->
                  @if (idol.isAthlete) {
                    <span class="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-blue-600/90 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-white">
                      ⚽ Atleta
                    </span>
                  } @else if (idol.role) {
                    <span class="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-amber-300">
                      {{ idol.role }}
                    </span>
                  }
                </div>

                <!-- Text info -->
                <div class="p-5 flex flex-col gap-2">
                  <h3 class="text-lg font-black text-slate-900 group-hover:text-amber-600 transition-colors leading-tight">
                    {{ idol.name }}
                  </h3>

                  @if (idol.isAthlete) {
                    <div class="flex items-center gap-3 text-sm font-semibold text-slate-500">
                      <span>⚽ {{ idol.statistics?.goals || 0 }} gols</span>
                      <span class="text-slate-200">•</span>
                      <span>🏟️ {{ idol.statistics?.matches || 0 }} jogos</span>
                    </div>
                  }

                  <p class="text-sm text-slate-500 line-clamp-2">{{ idol.description }}</p>

                  <span class="mt-1 text-xs font-bold uppercase tracking-wide text-amber-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Ler história
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </span>
                </div>
              </article>
            }
          </div>
        }
      </main>


    </div>

    <!-- DETAILS MODAL OVERLAY -->
    @if (selectedIdol()) {
      <div @fadeIn class="relative z-50">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" (click)="closeModal()"></div>
        
        <div class="fixed inset-0 z-10 w-screen flex items-center justify-center p-4 sm:p-0">
            
            <!-- Modal Box: fixed max-height, no overflow on container -->
            <div class="relative w-full sm:max-w-4xl max-h-[90vh] sm:max-h-[85vh] flex flex-col md:flex-row rounded-3xl bg-white text-left shadow-2xl overflow-hidden sm:my-8">
              
              <!-- Left: Image Column — fixed, never stretches -->
              <div class="flex-none w-2/5 relative bg-slate-100 hidden md:block" style="min-height: 520px; max-height: 85vh;">
                <img [src]="selectedIdol()?.photoUrl" appFallbackImg="cover" class="absolute inset-0 h-full w-full object-cover object-top" />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                <div class="absolute bottom-6 left-6 right-6">
                  <h2 class="text-3xl font-black text-white drop-shadow-lg">{{ selectedIdol()?.name }}</h2>
                </div>
              </div>
              
              <!-- Right: Content Column — scrolls internally -->
              <div class="w-full md:w-3/5 flex flex-col overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between md:hidden bg-slate-50">
                  <h2 class="text-xl font-bold text-slate-900">{{ selectedIdol()?.name }}</h2>
                  <button type="button" class="text-slate-400 hover:text-slate-500 rounded-lg p-1" (click)="closeModal()">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div class="hidden md:flex justify-end px-4 pt-4 absolute right-0 top-0 z-10">
                  <button type="button" class="rounded-full bg-slate-100 p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-colors shadow-sm" (click)="closeModal()">
                    <span class="sr-only">Fechar</span>
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div class="p-6 md:p-8 flex-1 overflow-y-auto overscroll-contain">
                  
                  @if (selectedIdol()?.isAthlete) {
                    <!-- Statistics Banner -->
                    <div class="grid grid-cols-2 gap-4 mb-8">
                      <div class="rounded-2xl bg-amber-50 border border-amber-100 p-4 text-center">
                        <div class="text-3xl font-black text-amber-600 font-mono">{{ selectedIdol()?.statistics?.matches || 0 }}</div>
                        <div class="text-xs font-bold uppercase tracking-widest text-amber-800 mt-1">Partidas</div>
                      </div>
                      <div class="rounded-2xl bg-indigo-50 border border-indigo-100 p-4 text-center">
                        <div class="text-3xl font-black text-indigo-600 font-mono">{{ selectedIdol()?.statistics?.goals || 0 }}</div>
                        <div class="text-xs font-bold uppercase tracking-widest text-indigo-800 mt-1">Gols</div>
                      </div>
                    </div>

                    @if (selectedIdol()?.statistics?.titles?.length) {
                      <div class="mb-8">
                        <h4 class="text-sm font-bold tracking-tight text-slate-900 mb-3 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                          Títulos Destacados
                        </h4>
                        <div class="flex flex-wrap gap-2">
                          @for (title of selectedIdol()?.statistics?.titles; track $index) {
                            <span class="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 ring-1 ring-inset ring-slate-200">{{ title }}</span>
                          }
                        </div>
                      </div>
                    }
                  }

                  <div class="prose prose-slate max-w-none text-slate-600 text-base leading-relaxed whitespace-pre-line">
                    {{ selectedIdol()?.description }}
                  </div>
                </div>
              </div>

            </div>
        </div>
      </div>
    }

  `,
})
export class PublicIdolsPageComponent implements OnInit {
  private idolsApi = inject(IdolsApiService);

  readonly idols = signal<Idol[]>([]);
  readonly loading = signal(true);
  readonly selectedIdol = signal<Idol | null>(null);

  ngOnInit() {
    this.idolsApi.listPublic().subscribe({
      next: (data: Idol[]) => {
        this.idols.set(data);
        this.loading.set(false);
      },
      error: (err: any) => this.loading.set(false)
    });
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
