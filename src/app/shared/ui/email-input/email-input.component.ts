import { Component, Input, signal, inject } from '@angular/core';
import { ControlValueAccessor, NgControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="relative w-full">
      <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <svg class="h-5 w-5 transition-colors" 
             [class]="dark ? 'text-white/20' : 'text-slate-400'"
             xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
      </div>
      <input
        type="email"
        [id]="id"
        [placeholder]="placeholder"
        [value]="value()"
        (input)="onInput($event)"
        (blur)="onBlur()"
        [disabled]="disabled()"
        [class]="dark ? 'bg-slate-950/40 border-white/10 text-white placeholder:text-white/5 focus:ring-amber-400/20 focus:border-amber-400/50 focus:bg-slate-950/60' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-indigo-500/10 focus:border-indigo-500'"
        class="w-full rounded-2xl border py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all disabled:cursor-not-allowed disabled:bg-slate-950/20 disabled:text-white/60"
        [class.border-rose-500]="isInvalidAndTouched() && !dark"
        [class.border-rose-500/50]="isInvalidAndTouched() && dark"
        [class.ring-rose-500/20]="isInvalidAndTouched()"
      />
    </div>
    @if (isInvalidAndTouched()) {
      <div class="flex items-center gap-1.5 ml-2 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-rose-500"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
        <span class="text-[10px] font-black text-rose-500 uppercase tracking-wider">E-mail inválido</span>
      </div>
    }
  `,
  providers: []
})
export class EmailInputComponent implements ControlValueAccessor {
  @Input() id = 'email';
  @Input() placeholder = 'seu@email.com';
  @Input() dark = false;

  readonly value = signal('');
  readonly disabled = signal(false);

  // Injetar o NgControl e vincular a si mesmo
  private readonly ngControl = inject(NgControl, { optional: true, self: true });

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  private onChangeCallback: (value: string) => void = () => {};
  onTouchedCallback: () => void = () => {};

  isInvalidAndTouched(): boolean {
    return !!(this.ngControl && this.ngControl.invalid && (this.ngControl.touched || this.ngControl.dirty));
  }

  onBlur(): void {
    this.onTouchedCallback();
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let rawValue = input.value.toLowerCase().replace(/\s/g, ''); // no spaces, lowercase

    input.value = rawValue;
    this.value.set(rawValue);
    this.onChangeCallback(rawValue);
  }

  // --- ControlValueAccessor methods ---
  writeValue(val: any): void {
    if (val !== undefined && val !== null) {
      this.value.set(String(val));
    } else {
      this.value.set('');
    }
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
