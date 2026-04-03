import { Component, Input, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="relative w-full">
      <input
        [type]="showPassword() ? 'text' : 'password'"
        [id]="id"
        [placeholder]="placeholder"
        [value]="value()"
        (input)="onInput($event)"
        (blur)="onTouchedCallback()"
        [disabled]="disabled()"
        [class]="dark ? 'bg-white/5 border-white/5 text-white placeholder:text-white/20 focus:ring-amber-400/20 focus:border-amber-400/50 focus:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-indigo-500/10 focus:border-indigo-500'"
        class="w-full rounded-2xl py-4 pl-5 pr-12 text-sm font-bold transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
      
      <button
        type="button"
        (click)="togglePassword()"
        class="absolute inset-y-0 right-0 flex items-center px-5 text-slate-400 hover:text-white transition"
        tabindex="-1"
      >
        @if (showPassword()) {
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
            <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
            <line x1="2" y1="2" x2="22" y2="22"></line>
          </svg>
        } @else {
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        }
      </button>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordInputComponent),
      multi: true,
    },
  ]
})
export class PasswordInputComponent implements ControlValueAccessor {
  @Input() id = 'password';
  @Input() placeholder = '********';
  @Input() dark = false;

  readonly showPassword = signal(false);
  readonly value = signal('');
  readonly disabled = signal(false);

  private onChangeCallback: (value: string) => void = () => {};
  onTouchedCallback: () => void = () => {};

  togglePassword(): void {
    this.showPassword.update((s) => !s);
  }

  onInput(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    this.value.set(inputValue);
    this.onChangeCallback(inputValue);
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
