import { CommonModule } from '@angular/common';
import { FallbackImgDirective } from '../../../shared/directives/fallback-img.directive';
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Sponsor } from '../../../core/models/sponsor.model';
import { SponsorsService } from '../../../core/services/sponsors.service';

@Component({
  selector: 'app-sponsors-carousel',
  standalone: true,
  imports: [CommonModule, FallbackImgDirective],
  template: `
    @if (sponsors().length > 0) {
      <div class="w-full overflow-hidden border-b border-slate-200 bg-white relative select-none group">
        <!-- Carousel Track Container -->
        <div 
          class="h-28 w-full cursor-pointer relative flex items-center overflow-hidden" 
          (click)="next()"
          (mouseenter)="pause()"
          (mouseleave)="resume()"
        >
          <!-- Fading Edges -->
          <div class="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div class="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

          <div class="flex items-center transition-transform duration-500 ease-out will-change-transform absolute h-full"
               [style.left]="'50%'"
               [style.transform]="'translate3d(-' + ((currentIndex() * 160) + 80) + 'px, 0, 0)'">
            
            @for (sponsor of sponsors(); track sponsor._id; let i = $index) {
              <div 
                class="h-16 w-32 mx-4 flex shrink-0 items-center justify-center transition-all duration-500 ease-out"
                (click)="$event.stopPropagation(); onClickSponsor(sponsor, i)"
                [ngClass]="{
                  'grayscale-0 scale-125 opacity-100 drop-shadow-md z-20': i === currentIndex(),
                  'grayscale opacity-30 scale-90 z-0 hover:opacity-60': i !== currentIndex()
                }"
              >
                <img [src]="sponsor.logoUrl" appFallbackImg="sponsor" class="max-h-full max-w-full object-contain pointer-events-none" />
              </div>
            }
          </div>
        </div>

        <!-- Navigation Arrows Overlay -->
        <button (click)="$event.stopPropagation(); prev()" 
                class="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-white text-slate-400 hover:text-slate-800 shadow border border-slate-200 z-30 transition hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>

        <button (click)="$event.stopPropagation(); next()" 
                class="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-white text-slate-400 hover:text-slate-800 shadow border border-slate-200 z-30 transition hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
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
