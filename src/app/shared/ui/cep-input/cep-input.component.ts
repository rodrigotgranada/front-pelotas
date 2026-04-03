import { Component, Input, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cep-input',
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
        maxlength="9"
        [class]="dark ? 'bg-white/5 border-white/5 text-white placeholder:text-white/10 focus:ring-amber-400/20 focus:border-amber-400/50 focus:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-indigo-500/10 focus:border-indigo-500'"
        class="w-full rounded-2xl border py-4 px-4 text-sm font-bold outline-none transition-all disabled:cursor-not-allowed disabled:bg-slate-50/5 disabled:opacity-50"
      />
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CepInputComponent),
      multi: true,
    },
  ]
})
export class CepInputComponent implements ControlValueAccessor {
  @Input() id = 'cep';
  @Input() placeholder = '00000-000';
  @Input() dark = false;

  readonly value = signal('');
  readonly disabled = signal(false);

  private onChangeCallback: (value: string) => void = () => {};
  onTouchedCallback: () => void = () => {};

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let rawValue = input.value.replace(/\D/g, '').slice(0, 8);
    
    // Apply Mask: 00000-000
    let maskedValue = rawValue;
    if (rawValue.length > 5) {
      maskedValue = `${rawValue.slice(0, 5)}-${rawValue.slice(5)}`;
    }

    // Force update on the native element for immediate UI feedback
    input.value = maskedValue;

    // Save and emit mask
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
