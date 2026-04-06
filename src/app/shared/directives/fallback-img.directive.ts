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
  private readonly MAX_RETRIES = 3;
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
      
      // Auto-ativar o escudo protetor se src vier nulo/vazio do banco de dados (Angular binding empty)
      setTimeout(() => {
        const src = img.getAttribute('src');
        if (!src || src === 'null' || src === '') {
          this.loadFallback();
        }
      }, 0);
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
       console.warn(`[🐺 Fallback] Erro na imagem. Tentativa: ${this.retryCount + 1}/${this.MAX_RETRIES}`);
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
    
    let nextSrc = '';

    if (!this.appFallbackImg || this.appFallbackImg === 'cover') {
      nextSrc = this.retryCount === 1 && this.appSettings.defaultNewsImageUrl() ? this.appSettings.defaultNewsImageUrl()! : '/assets/placeholder-cover.svg';
    } else if (this.appFallbackImg === 'sponsor') {
      nextSrc = '/assets/placeholder-sponsor.svg';
    } else if (this.appFallbackImg === 'badge' || this.appFallbackImg === 'team') {
      nextSrc = this.retryCount === 1 && this.appSettings.defaultTeamLogoUrl() ? this.appSettings.defaultTeamLogoUrl()! : '/assets/placeholder-badge.svg';
    } else if (this.appFallbackImg === 'competition') {
      nextSrc = this.retryCount === 1 && this.appSettings.defaultCompetitionLogoUrl() ? this.appSettings.defaultCompetitionLogoUrl()! : '/assets/placeholder-badge.svg';
    } else {
      nextSrc = this.appFallbackImg;
    }
    
    imgElement.src = nextSrc;
    imgElement.style.objectFit = 'contain';
  }
}
