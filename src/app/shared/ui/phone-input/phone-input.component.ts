import { Component, Input, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-phone-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="relative w-full">
      <input
        type="text"
        [id]="id"
        [placeholder]="placeholder"
        [value]="value()"
        (input)="onInput($event)"
        (blur)="onTouchedCallback()"
        [disabled]="disabled()"
        maxlength="15"
        [class]="dark ? 'bg-slate-950/40 border-white/10 text-white placeholder:text-white/5 focus:ring-amber-400/20 focus:border-amber-400/50 focus:bg-slate-950/60' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-indigo-500/10 focus:border-indigo-500'"
        class="w-full rounded-2xl border py-4 px-4 text-sm font-bold outline-none transition-all disabled:cursor-not-allowed disabled:bg-slate-950/20 disabled:text-white/60"
      />
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true,
    },
  ]
})
export class PhoneInputComponent implements ControlValueAccessor {
  @Input() id = 'phone';
  @Input() placeholder = '(00) 00000-0000';
  @Input() dark = false;

  readonly value = signal('');
  readonly disabled = signal(false);

  private onChangeCallback: (value: string) => void = () => {};
  onTouchedCallback: () => void = () => {};

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const maskedValue = this.applyMask(input.value);
    
    // Force update on the native element for immediate UI feedback
    input.value = maskedValue;

    // Save and emit mask
    this.value.set(maskedValue);
    this.onChangeCallback(maskedValue);
  }

  private applyMask(val: string): string {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    
    if (digits.length === 0) return '';
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  // --- ControlValueAccessor methods ---
  writeValue(val: any): void {
    const stringVal = val !== undefined && val !== null ? String(val) : '';
    this.value.set(this.applyMask(stringVal));
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
