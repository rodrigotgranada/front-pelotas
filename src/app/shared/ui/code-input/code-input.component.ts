import {
  Component,
  ElementRef,
  forwardRef,
  Input,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-code-input',
  template: `
    <div class="flex gap-2 items-center justify-between" [class.opacity-50]="disabled">
      @for (digit of digits; track $index) {
        <input
          #inputRef
          type="text"
          inputmode="numeric"
          maxlength="1"
          [value]="digit"
          [disabled]="disabled"
          (input)="onInput($event, $index)"
          (keydown)="onKeyDown($event, $index)"
          (paste)="onPaste($event, $index)"
          (focus)="onFocus($event)"
          class="w-12 h-14 text-center text-xl font-bold rounded-xl border border-slate-300 bg-white shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
          [class.border-red-300]="hasError"
          [class.focus:border-red-500]="hasError"
          [class.focus:ring-red-200]="hasError"
        />
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CodeInputComponent),
      multi: true,
    },
  ],
})
export class CodeInputComponent implements ControlValueAccessor {
  @Input() length = 6;
  @Input() hasError = false;
  
  @ViewChildren('inputRef') inputRefs!: QueryList<ElementRef<HTMLInputElement>>;

  digits: string[] = Array(this.length).fill('');
  disabled = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    const stringValue = value || '';
    this.digits = Array.from({ length: this.length }, (_, i) => stringValue[i] || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    // Allow only numbers
    if (value && !/^\d$/.test(value)) {
      input.value = this.digits[index];
      return;
    }

    this.digits[index] = value;
    this.emitChange();

    if (value && index < this.length - 1) {
      this.focusInput(index + 1);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.digits[index] && index > 0) {
      // If backspace is pressed on an empty input, focus previous and clear it
      this.digits[index - 1] = '';
      this.emitChange();
      this.focusInput(index - 1);
    } else if (event.key === 'ArrowLeft' && index > 0) {
      this.focusInput(index - 1);
    } else if (event.key === 'ArrowRight' && index < this.length - 1) {
      this.focusInput(index + 1);
    }
  }

  onPaste(event: ClipboardEvent, index: number): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const pastedNumbers = pastedData.replace(/\D/g, '').split('');

    if (pastedNumbers.length === 0) {
      return;
    }

    for (let i = 0; i < pastedNumbers.length; i++) {
      const targetIndex = index + i;
      if (targetIndex < this.length) {
        this.digits[targetIndex] = pastedNumbers[i];
      }
    }

    this.emitChange();
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = this.digits.findIndex((val, i) => i >= index && !val);
    if (nextEmptyIndex !== -1 && nextEmptyIndex < this.length) {
      this.focusInput(nextEmptyIndex);
    } else {
      this.focusInput(Math.min(index + pastedNumbers.length, this.length - 1));
    }
  }

  onFocus(event: FocusEvent): void {
    this.onTouched();
    // Select the content on focus to make it easier to replace
    (event.target as HTMLInputElement).select();
  }

  private emitChange(): void {
    const value = this.digits.join('');
    this.onChange(value);
  }

  private focusInput(index: number): void {
    const inputElements = this.inputRefs.toArray();
    if (inputElements[index]) {
      inputElements[index].nativeElement.focus();
    }
  }
}
