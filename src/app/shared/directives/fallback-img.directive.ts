import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[appFallbackImg]',
  standalone: true
})
export class FallbackImgDirective {
  /** Opcional: Define um tipo de fallback. Pode ser 'cover', 'sponsor', 'badge', 'team' ou passa o URL direto */
  @Input() appFallbackImg: 'cover' | 'sponsor' | 'badge' | 'team' | string = 'cover';
  private retryCount = 0;
  private readonly MAX_RETRIES = 2;

  constructor(private readonly eRef: ElementRef<HTMLImageElement>) {}

  @HostListener('error')
  loadFallback() {
    if (this.retryCount >= this.MAX_RETRIES) {
      this.eRef.nativeElement.src = ''; // Para o loop
      this.eRef.nativeElement.style.display = 'none'; // Esconde imagem quebrada
      return;
    }
    
    this.retryCount++;
    const imgElement = this.eRef.nativeElement;

    if (!this.appFallbackImg || this.appFallbackImg === 'cover') {
      imgElement.src = '/placeholder-cover.svg';
    } else if (this.appFallbackImg === 'sponsor') {
      imgElement.src = '/placeholder-sponsor.svg';
    } else if (this.appFallbackImg === 'badge' || this.appFallbackImg === 'team') {
      imgElement.src = '/placeholder-badge.svg';
    } else {
      imgElement.src = this.appFallbackImg; // Custom pass
    }
    
    imgElement.style.objectFit = 'contain';
  }
}
