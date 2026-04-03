import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { compressImage } from '../../utils/image-compress.util';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="group relative h-28 w-28 shrink-0 overflow-hidden rounded-[32px] border transition-all duration-300 focus-within:ring-4 focus-within:ring-amber-400/20"
      [class]="dark ? 'border-white/10 bg-white/5 shadow-2xl' : 'border-slate-200 bg-slate-50 shadow-lg'"
      [class.opacity-50]="disabled"
      [class.cursor-not-allowed]="disabled"
    >
      <!-- Preview Image -->
      @if (photoUrl) {
        <img [src]="photoUrl" alt="Foto selecionada" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
      } @else {
        <div class="flex h-full w-full flex-col items-center justify-center p-4 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
               [class]="dark ? 'text-white/20' : 'text-slate-300'">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span class="mt-2 text-[9px] font-black uppercase tracking-widest" [class]="dark ? 'text-white/20' : 'text-slate-400'">Sem foto</span>
        </div>
      }

      <!-- Overlay for interactions when enabled -->
      @if (!disabled) {
        <div class="absolute inset-0 flex items-center justify-center bg-indigo-950/60 backdrop-blur-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          
          @if (photoUrl) {
            <!-- Has photo: show Edit (Pencil) and Remove (Trash) -->
            <div class="flex gap-2 relative z-10">
              <label class="cursor-pointer rounded-xl bg-white/10 p-2.5 text-white hover:bg-amber-400 hover:text-indigo-950 transition-all border border-white/10" title="Trocar foto">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  <path d="m15 5 4 4"/>
                </svg>
                <input type="file" accept="image/*" class="sr-only" (change)="onFileChange($event)" />
              </label>
              <button type="button" class="rounded-xl bg-rose-500/80 p-2.5 text-white hover:bg-rose-600 transition-all border border-rose-500/20" title="Remover foto" (click)="onRemove()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </button>
            </div>
          } @else {
            <!-- No photo: show Add (Plus) -->
            <label class="cursor-pointer rounded-2xl bg-amber-400 p-3 text-indigo-950 hover:bg-amber-500 transition-all shadow-xl shadow-amber-400/20" title="Adicionar foto">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
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
  @Input() dark = false;
  
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
