import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-spinner-overlay',
  imports: [SpinnerComponent],
  templateUrl: './spinner-overlay.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerOverlayComponent {
  readonly label = input('Carregando...');
}
