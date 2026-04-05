import { Component, Input, forwardRef, signal, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cpf-input',
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
        maxlength="14"
        [class]="dark ? 'bg-slate-950/40 border-white/10 text-white placeholder:text-white/5 focus:ring-amber-400/20 focus:border-amber-400/50 focus:bg-slate-950/60' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-indigo-500/10 focus:border-indigo-500'"
        class="w-full rounded-2xl border py-4 px-4 text-sm font-bold outline-none transition-all disabled:cursor-not-allowed disabled:bg-slate-950/20 disabled:text-white/60"
      />
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CpfInputComponent),
      multi: true,
    },
  ]
})
export class CpfInputComponent implements ControlValueAccessor {
  @Input() id = 'cpf';
  @Input() placeholder = '000.000.000-00';
  @Input() dark = false;

  readonly value = signal('');
  readonly disabled = signal(false);

  private onChangeCallback: (value: string) => void = () => {};
  onTouchedCallback: () => void = () => {};

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let rawValue = input.value.replace(/\D/g, '').slice(0, 11);
    
    // Apply Mask: 000.000.000-00
    let maskedValue = rawValue;
    if (rawValue.length > 9) {
      maskedValue = `${rawValue.slice(0, 3)}.${rawValue.slice(3, 6)}.${rawValue.slice(6, 9)}-${rawValue.slice(9)}`;
    } else if (rawValue.length > 6) {
      maskedValue = `${rawValue.slice(0, 3)}.${rawValue.slice(3, 6)}.${rawValue.slice(6)}`;
    } else if (rawValue.length > 3) {
      maskedValue = `${rawValue.slice(0, 3)}.${rawValue.slice(3)}`;
    }

    // Force update on the native element for immediate UI feedback
    input.value = maskedValue;

    // Only emit raw digits up to ReactiveForms if preferred, or emit mask.
    // The previous implementation used the mask directly in the API call but sanitized it in Auth.
    // We emit the masked value to match user expectation in the form value.
    this.value.set(maskedValue);
    this.onChangeCallback(maskedValue);
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
