import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCroppedEvent, ImageCropperComponent, LoadedImage } from 'ngx-image-cropper';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-image-cropper-dialog',
  standalone: true,
  imports: [CommonModule, ImageCropperComponent, SpinnerComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div class="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 class="text-sm font-bold text-slate-800">Ajustar Imagem</h2>
          <button
            type="button"
            class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            (click)="onCancel()"
            [disabled]="processing()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Cropper Area -->
        <div class="bg-slate-50 relative p-4 flex flex-col items-center justify-center min-h-[300px]">
          @if (loading()) {
            <div class="absolute inset-0 flex items-center justify-center bg-slate-50/80 z-10">
              <app-spinner label="Carregando imagem..." size="md" />
            </div>
          }
          
          <image-cropper
            class="max-h-[350px]"
            [imageChangedEvent]="imageChangedEvent"
            [maintainAspectRatio]="true"
            [aspectRatio]="1 / 1"
            [resizeToWidth]="400"
            [cropperMinHeight]="100"
            [cropperMinWidth]="100"
            [roundCropper]="true"
            format="png"
            (imageCropped)="imageCropped($event)"
            (imageLoaded)="imageLoaded()"
            (cropperReady)="cropperReady()"
            (loadImageFailed)="loadImageFailed()"
            [transform]="transform"
            [canvasRotation]="rotation"
          ></image-cropper>
        </div>

        <!-- Toolbar (Zoom) -->
        <div class="border-t border-slate-200 bg-white px-4 py-3 flex items-center gap-3">
          <svg class="w-4 h-4 text-slate-500 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
          
          <input 
            type="range" 
            min="1" 
            max="3" 
            step="0.1" 
            [value]="transform.scale"
            (input)="zoomChanged($event)"
            class="w-full accent-cyan-600 rounded-lg appearance-none bg-slate-200 h-1.5 cursor-pointer outline-none focus:ring-2 focus:ring-cyan-300 transition"
          />
          
          <svg class="w-5 h-5 text-slate-500 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
          <button
            type="button"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            (click)="onCancel()"
            [disabled]="processing()"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            class="flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:opacity-50"
            (click)="onConfirm()"
            [disabled]="loading() || processing() || !croppedBlob"
          >
            @if (processing()) {
              <app-spinner label="Aplicando..." size="sm" [inline]="true" />
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Confirmar
            }
          </button>
        </div>

      </div>
    </div>
  `
})
export class ImageCropperDialogComponent {
  @Input() imageChangedEvent: any = '';
  @Output() imageCroppedEvent = new EventEmitter<Blob>();
  @Output() cancel = new EventEmitter<void>();

  croppedImage: string = '';
  croppedBlob: Blob | null | undefined = null;
  transform: { scale: number } = { scale: 1 };
  rotation = 0;
  
  loading = signal(true);
  processing = signal(false);

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.objectUrl || event.base64 || '';
    this.croppedBlob = event.blob;
  }

  imageLoaded() {
    // Show cropper
  }

  cropperReady() {
    this.loading.set(false);
  }

  loadImageFailed() {
    this.loading.set(false);
    this.onCancel();
  }

  zoomChanged(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    this.transform = {
      ...this.transform,
      scale: value
    };
  }

  onCancel() {
    this.cancel.emit();
  }

  onConfirm() {
    if (this.croppedBlob) {
      this.processing.set(true);
      // Simular leve delay visual de processamento (se necessario)
      setTimeout(() => {
        this.imageCroppedEvent.emit(this.croppedBlob!);
        this.processing.set(false);
      }, 300);
    }
  }
}
