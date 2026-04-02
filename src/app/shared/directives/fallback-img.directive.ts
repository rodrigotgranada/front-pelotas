import { Directive, ElementRef, Input, NgZone, OnInit, OnDestroy, inject } from '@angular/core';
import { AppSettingsService } from '../../core/services/app-settings.service';

@Directive({
  selector: 'img[appFallbackImg]',
  standalone: true
})
export class FallbackImgDirective implements OnInit, OnDestroy {
  /** Opcional: Define um tipo de fallback. Pode ser 'cover', 'sponsor', 'badge', 'team' ou passa o URL direto */
  @Input() appFallbackImg: 'cover' | 'sponsor' | 'badge' | 'team' | string = 'cover';
  private retryCount = 0;
  private readonly MAX_RETRIES = 2;
  private errorListener?: () => void;

  // SVG de 1x1 transparente para calar o navegador em caso de erro total
  private readonly BLANK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjwvc3ZnPg==';
  private readonly appSettings = inject(AppSettingsService);

  constructor(
    private readonly eRef: ElementRef<HTMLImageElement>,
    private readonly zone: NgZone
  ) {
    if ((window as any).LOBO_DEBUG) {
      console.log('🐺 LOBO DEBUG: FallbackImgDirective instanciada');
    }
  }

  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      const img = this.eRef.nativeElement;
      this.errorListener = () => this.loadFallback();
      img.addEventListener('error', this.errorListener);
    });
  }

  ngOnDestroy() {
    if (this.errorListener) {
      this.eRef.nativeElement.removeEventListener('error', this.errorListener);
    }
  }

  private loadFallback() {
    const imgElement = this.eRef.nativeElement;
    
    if ((window as any).LOBO_DEBUG) {
       console.warn(`[🐺 Fallback] Erro na imagem: ${imgElement.src.substring(0, 50)}... Tentativa: ${this.retryCount + 1}/${this.MAX_RETRIES}`);
    }

    if (this.retryCount >= this.MAX_RETRIES) {
      if ((window as any).LOBO_DEBUG) {
        console.error('[🐺 Fallback] Máximo de tentativas atingido. Silenciando com Base64.');
      }
      imgElement.src = this.BLANK_IMAGE; 
      imgElement.style.display = 'none'; 
      return;
    }
    
    this.retryCount++;

    if (!this.appFallbackImg || this.appFallbackImg === 'cover') {
      imgElement.src = this.appSettings.defaultNewsImageUrl() || '/assets/placeholder-cover.svg';
    } else if (this.appFallbackImg === 'sponsor') {
      imgElement.src = '/assets/placeholder-sponsor.svg';
    } else if (this.appFallbackImg === 'badge' || this.appFallbackImg === 'team') {
      imgElement.src = this.appSettings.defaultTeamLogoUrl() || '/assets/placeholder-badge.svg';
    } else if (this.appFallbackImg === 'competition') {
      imgElement.src = this.appSettings.defaultCompetitionLogoUrl() || '/assets/placeholder-badge.svg';
    } else {
      imgElement.src = this.appFallbackImg;
    }
    
    imgElement.style.objectFit = 'contain';
  }
}
