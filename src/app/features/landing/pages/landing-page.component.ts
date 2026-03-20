import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthTokenService } from '../../../core/auth/auth-token.service';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink],
  templateUrl: './landing-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {
  private readonly authTokenService = inject(AuthTokenService);

  readonly isAuthenticated = () => !!this.authTokenService.getToken();
}
