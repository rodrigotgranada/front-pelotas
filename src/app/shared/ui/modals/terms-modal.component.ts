import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/80 backdrop-blur-md" (click)="close.emit()"></div>

      <!-- Modal Content -->
      <div class="relative w-full max-w-2xl bg-indigo-950/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        
        <!-- Decoration -->
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-amber-400/10 blur-[80px] rounded-full"></div>
        <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full"></div>

        <!-- Header -->
        <div class="relative p-8 pb-4 flex items-center justify-between border-b border-white/5">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
            </div>
            <div>
              <h2 class="text-white text-xl font-black uppercase tracking-tight">Código de Conduta</h2>
              <p class="text-[10px] text-amber-400/60 font-black uppercase tracking-[0.2em] mt-0.5">Esporte Clube Pelotas</p>
            </div>
          </div>
          
          <button (click)="close.emit()" class="p-3 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="relative flex-1 overflow-y-auto p-8 custom-scrollbar">
          @if (content) {
            <div class="prose prose-invert max-w-none">
              <p class="text-white/80 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {{ content }}
              </p>
            </div>
          } @else {
            <div class="flex flex-col items-center justify-center py-20 opacity-20">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p class="text-xs font-black uppercase tracking-widest mt-4">Nenhum termo cadastrado</p>
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="relative p-8 pt-4 border-t border-white/5 bg-black/20 flex justify-end">
          <button 
            (click)="close.emit()" 
            class="px-8 py-3 bg-white hover:bg-slate-100 text-indigo-950 text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95 shadow-xl"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.02);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `]
})
export class TermsModalComponent {
  @Input() content: string = '';
  @Output() close = new EventEmitter<void>();
}
