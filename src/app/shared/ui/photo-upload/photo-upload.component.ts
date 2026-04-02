import { Component, EventEmitter, Input, Output } from '@angular/core';
import { compressImage } from '../../utils/image-compress.util';

@Component({
  selector: 'app-photo-upload',
  template: `
    <div 
      class="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-slate-300 bg-slate-100 transition focus-within:ring-2 focus-within:ring-cyan-500 focus-within:ring-offset-2"
      [class.opacity-50]="disabled"
      [class.cursor-not-allowed]="disabled"
    >
      <!-- Preview Image -->
      @if (photoUrl) {
        <img [src]="photoUrl" alt="Foto selecionada" class="h-full w-full object-cover" />
      } @else {
        <div class="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-500">Sem foto</div>
      }

      <!-- Overlay for interactions when enabled -->
      @if (!disabled) {
        <div class="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 transition-opacity group-hover:opacity-100">
          
          @if (photoUrl) {
            <!-- Has photo: show Edit (Pencil) and Remove (Trash) -->
            <div class="flex gap-2">
              <label class="cursor-pointer rounded-full bg-white/20 p-1.5 text-white hover:bg-white/40 transition" title="Trocar foto">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  <path d="m15 5 4 4"/>
                </svg>
                <input type="file" accept="image/*" class="sr-only" (change)="onFileChange($event)" />
              </label>
              <button type="button" class="rounded-full bg-rose-500/80 p-1.5 text-white hover:bg-rose-600 transition" title="Remover foto" (click)="onRemove()">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  <line x1="10" x2="10" y1="11" y2="17"/>
                  <line x1="14" x2="14" y1="11" y2="17"/>
                </svg>
              </button>
            </div>
          } @else {
            <!-- No photo: show Add (Plus) -->
            <label class="cursor-pointer rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition" title="Adicionar foto">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/>
                <path d="M12 5v14"/>
              </svg>
              <input type="file" accept="image/*" class="sr-only" (change)="onFileChange($event)" />
            </label>
          }
        </div>
      }
    </div>
  `
})
export class PhotoUploadComponent {
  @Input() photoUrl: string | null = null;
  @Input() disabled = false;
  
  @Output() fileSelected = new EventEmitter<File>();
  @Output() photoRemoved = new EventEmitter<void>();

  async onFileChange(event: Event): Promise<void> {
    if (this.disabled) return;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    // Reset so same file can be selected again
    input.value = '';
    // Compress before emitting (max 512px for avatars, JPEG 85%)
    try {
      const compressed = await compressImage(file, 512, 512, 0.85);
      const compressedFile = new File([compressed], `avatar-${Date.now()}.${compressed.type.split('/')[1]}`, { type: compressed.type });
      this.fileSelected.emit(compressedFile);
    } catch {
      // Fallback: emit original file if compression fails
      this.fileSelected.emit(file);
    }
  }

  onRemove(): void {
    if (this.disabled) return;
    this.photoRemoved.emit();
  }
}
