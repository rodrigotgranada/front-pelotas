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
        class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none ring-cyan-200 transition focus:ring pr-12 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-75"
      />
      
      <button
        type="button"
        (click)="togglePassword()"
        class="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-slate-600 transition"
        tabindex="-1"
      >
        @if (showPassword()) {
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-.722-3.25"></path>
            <path d="M2 8a10.645 10.645 0 0 0 20 0"></path>
            <path d="m20 15-1.726-2.05"></path>
            <path d="m4 15 1.726-2.05"></path>
            <path d="m9 18 .722-3.25"></path>
          </svg>
        } @else {
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
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
