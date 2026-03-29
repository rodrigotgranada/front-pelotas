import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[appFallbackImg]',
  standalone: true
})
export class FallbackImgDirective {
  /** Opcional: Define um tipo de fallback. Pode ser 'cover', 'sponsor', ou passa o URL direto */
  @Input() appFallbackImg: 'cover' | 'sponsor' | 'badge' | string = 'cover';
  private hasError = false;

  constructor(private readonly eRef: ElementRef<HTMLImageElement>) {}

  @HostListener('error')
  loadFallback() {
    if (this.hasError) return; // Evita loop infinito se o próprio fallback estiver quebrado
    
    this.hasError = true;
    const imgElement = this.eRef.nativeElement;

    if (!this.appFallbackImg || this.appFallbackImg === 'cover') {
      imgElement.src = '/placeholder-cover.svg';
    } else if (this.appFallbackImg === 'sponsor') {
      imgElement.src = '/placeholder-sponsor.svg';
    } else if (this.appFallbackImg === 'badge') {
      imgElement.src = '/placeholder-badge.svg';
    } else {
      imgElement.src = this.appFallbackImg; // Custom pass
    }
    
    // Ajuda visual se necessário (mantém o contain scale)
    imgElement.style.objectFit = 'contain';
  }
}
