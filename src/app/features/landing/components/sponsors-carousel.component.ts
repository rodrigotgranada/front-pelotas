import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Sponsor } from '../../../core/models/sponsor.model';
import { SponsorsService } from '../../../core/services/sponsors.service';

@Component({
  selector: 'app-sponsors-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (sponsors().length > 0) {
      <div class="mb-10 w-full overflow-hidden border-y border-slate-200 bg-white shadow-sm rounded-2xl relative select-none">
        
        <div class="px-6 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between z-20 relative">
          <span class="text-[10px] font-bold uppercase tracking-widest text-slate-500">Patrocinadores Oficiais</span>
          <div class="flex items-center gap-2">
            <button (click)="prev()" class="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button (click)="next()" class="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>

        <!-- Carousel Track Container -->
        <!-- O calc(50% - X) garante que o item sempre preencha o centro da div independentemente do tamanho da tela. Cada item tem 160px de largura final (128px + 32px de gap) -->
        <div 
          class="h-28 w-full bg-white cursor-pointer relative flex items-center overflow-hidden" 
          (click)="next()"
          (mouseenter)="pause()"
          (mouseleave)="resume()"
        >
          <!-- Fading Edges to hide entering/leaving logos gracefully -->
          <div class="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div class="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

          <div class="flex items-center transition-transform duration-500 ease-out will-change-transform absolute left-0"
               [style.transform]="'translate3d(calc(50% - ' + ((currentIndex() * 160) + 80) + 'px), 0, 0)'">
            
            @for (sponsor of sponsors(); track sponsor._id; let i = $index) {
              <div 
                class="h-16 w-32 mx-4 flex shrink-0 items-center justify-center transition-all duration-500 ease-out"
                (click)="$event.stopPropagation(); onClickSponsor(sponsor, i)"
                [ngClass]="{
                  'grayscale-0 scale-125 opacity-100 drop-shadow-md z-20': i === currentIndex(),
                  'grayscale opacity-30 scale-90 z-0 hover:opacity-60': i !== currentIndex()
                }"
              >
                <img [src]="sponsor.logoUrl" class="max-h-full max-w-full object-contain pointer-events-none" />
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class SponsorsCarouselComponent implements OnInit, OnDestroy {
  private readonly sponsorsService = inject(SponsorsService);

  readonly sponsors = signal<Sponsor[]>([]);
  readonly currentIndex = signal(0);
  
  private intervalId: any;
  private isPaused = false;

  ngOnInit() {
    this.sponsorsService.findAllPublic().subscribe((data: Sponsor[]) => {
      this.sponsors.set(data || []);
      if (data && data.length > 1) {
        this.startAutoPlay();
      }
    });
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.intervalId = setInterval(() => {
      if (!this.isPaused) {
        this.nextSlide();
      }
    }, 3000); // 3 seconds per slide
  }

  stopAutoPlay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  next() {
    this.nextSlide();
    this.startAutoPlay(); // Reset timer on manual action
  }

  prev() {
    const list = this.sponsors();
    if (list.length === 0) return;
    const current = this.currentIndex();
    this.currentIndex.set(current === 0 ? list.length - 1 : current - 1);
    this.startAutoPlay();
  }

  nextSlide() {
    const list = this.sponsors();
    if (list.length === 0) return;
    const current = this.currentIndex();
    this.currentIndex.set(current === list.length - 1 ? 0 : current + 1);
  }

  onClickSponsor(sponsor: Sponsor, index: number) {
    if (index === this.currentIndex()) {
      // It's the center active element, go to URL
      if (sponsor.websiteUrl) {
        window.open(sponsor.websiteUrl, '_blank');
      }
    } else {
      // Bring it to center and reset auto-play
      this.currentIndex.set(index);
      this.startAutoPlay();
    }
  }
}
