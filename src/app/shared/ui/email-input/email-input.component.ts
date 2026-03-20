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
        <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
      </div>
      <input
        type="email"
        [id]="id"
        [placeholder]="placeholder"
        [value]="value()"
        (input)="onInput($event)"
        (blur)="onBlur()"
        [disabled]="disabled()"
        class="w-full rounded-xl border py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:ring disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-75"
        [class.border-red-400]="isInvalidAndTouched()"
        [class.ring-red-200]="isInvalidAndTouched()"
        [class.border-slate-300]="!isInvalidAndTouched()"
        [class.ring-cyan-200]="!isInvalidAndTouched()"
      />
    </div>
    @if (isInvalidAndTouched()) {
      <p class="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        E-mail ivalido. Verifique o endereco digitado.
      </p>
    }
  `,
  providers: []
})
export class EmailInputComponent implements ControlValueAccessor {
  @Input() id = 'email';
  @Input() placeholder = 'seu@email.com';

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
