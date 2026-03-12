import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthTokenService } from './core/auth/auth-token.service';
import { AuthApiService } from './core/services/auth-api.service';
import { AuthSessionService } from './core/auth/auth-session.service';
import { LoadingService } from './core/http/loading.service';
import { getRoleDebugInfo, resolveRoleWithStoredCode } from './core/auth/roles.util';
import { ToastMessagesService } from './core/notifications/toast-messages.service';
import { SpinnerOverlayComponent } from './shared/ui/spinner-overlay/spinner-overlay.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SpinnerOverlayComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private readonly tokenService = inject(AuthTokenService);
  private readonly authApi = inject(AuthApiService);
  private readonly session = inject(AuthSessionService);
  private readonly loadingService = inject(LoadingService);
  private readonly toast = inject(ToastMessagesService);
  private readonly router = inject(Router);

  readonly hasToken = computed(() => !!this.tokenService.token());
  readonly me = this.session.me;
  readonly canAccessAdminData = computed(() => {
    if (!this.hasToken()) {
      return false;
    }

    const token = this.tokenService.getToken();
    const storedRoleCode = this.tokenService.getRoleCode();
    const role = resolveRoleWithStoredCode(this.me(), token, storedRoleCode);

    let rbacDebugEnabled = !environment.production;
    try {
      rbacDebugEnabled = rbacDebugEnabled || localStorage.getItem('pelotas.rbac-debug') === '1';
    } catch {
      // Ignore storage access issues (SSR/privacy mode).
    }

    if (rbacDebugEnabled) {
      console.info('[RBAC][menu]', {
        canAccessAdminData: role === 'owner' || role === 'admin',
        ...getRoleDebugInfo(this.me(), token, storedRoleCode),
      });
    }

    return role === 'owner' || role === 'admin';
  });
  readonly globalLoading = this.loadingService.isLoading;

  async ngOnInit(): Promise<void> {
    const result = await this.session.hydrateSession();

    if (result === 'invalid-session') {
      await this.router.navigateByUrl('/');
    }
  }

  onLogout(): void {
    this.authApi.logout();
    this.session.clear();
    this.toast.showLogoutInfo();
    void this.router.navigateByUrl('/');
  }
}
