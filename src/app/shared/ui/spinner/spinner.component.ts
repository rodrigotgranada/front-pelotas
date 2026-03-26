import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  templateUrl: './spinner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
})
export class SpinnerComponent {
  readonly label = input('Carregando...');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly inline = input(false);

  readonly circleSizeClass = computed(() => {
    switch (this.size()) {
      case 'sm':
        return 'h-4 w-4 border-2';
      case 'lg':
        return 'h-10 w-10 border-4';
      default:
        return 'h-6 w-6 border-[3px]';
    }
  });
}
