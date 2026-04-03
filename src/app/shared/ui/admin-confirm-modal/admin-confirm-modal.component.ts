import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'app-admin-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      (click)="cancel()"
    >
      <div 
        class="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        (click)="$event.stopPropagation()"
      >
        <div class="p-8 text-center">
          <!-- Icon -->
            <div 
              [class]="type === 'danger' ? 'bg-rose-50 text-rose-600' : (type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')"
              class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              @if (type === 'danger') {
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              } @else if (type === 'success') {
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 9 4 4-4 4"/><path d="M12 5v14"/><path d="M5 12h14"/></svg>
              }
            </div>

          <h3 class="text-xl font-black text-slate-900 mb-2">{{ title }}</h3>
          <p class="text-sm font-bold text-slate-500 leading-relaxed">
            {{ message }}
          </p>
        </div>

        <div class="flex border-t border-slate-100 p-4 gap-3 bg-slate-50/50">
          <button 
            (click)="cancel()" 
            class="flex-1 py-3 px-4 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-widest"
          >
            {{ cancelText }}
          </button>
          <button 
            (click)="confirm()" 
            [class]="type === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : (type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-brand-600 hover:bg-brand-700')"
            class="flex-1 py-3 px-4 rounded-xl text-xs font-black text-white shadow-lg transition-all active:scale-95 uppercase tracking-widest"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class AdminConfirmModalComponent {
  @Input() title = 'Você tem certeza?';
  @Input() message = 'Esta ação não poderá ser desfeita.';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() type: 'danger' | 'warning' | 'success' | string = 'danger';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  confirm() {
    this.confirmed.emit();
  }

  cancel() {
    this.cancelled.emit();
  }
}
