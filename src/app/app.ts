import { ChangeDetectionStrategy, Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthTokenService } from './core/auth/auth-token.service';
import { AuthApiService } from './core/services/auth-api.service';
import { AuthSessionService } from './core/auth/auth-session.service';
import { LoadingService } from './core/http/loading.service';
import { getRoleDebugInfo, resolveRoleWithStoredCode } from './core/auth/roles.util';
import { ToastMessagesService } from './core/notifications/toast-messages.service';
import { SpinnerOverlayComponent } from './shared/ui/spinner-overlay/spinner-overlay.component';
import { FormsModule } from '@angular/forms';
import { AppSettingsService } from './core/services/app-settings.service';
import { environment } from '../environments/environment';
import { PublicFooterComponent } from './shared/ui/public-footer/public-footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, SpinnerOverlayComponent, FormsModule, PublicFooterComponent],
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
  readonly router = inject(Router);
  readonly appSettings = inject(AppSettingsService);
  readonly searchQuery = signal('');
  private readonly currentUrl = signal(this.router.url);

  readonly hasToken = computed(() => !!this.tokenService.token());
  readonly me = this.session.me;
  readonly badgeUrl = this.appSettings.badgeUrl;
  readonly isMembershipEnabled = this.appSettings.isMembershipEnabled;
  readonly isSquadsEnabled = this.appSettings.isSquadsEnabled;
  readonly isNewsletterEnabled = this.appSettings.isNewsletterEnabled;
  readonly isIdolsEnabled = this.appSettings.isIdolsEnabled;

  readonly dropdownOpen = signal(false);
  readonly isGlobalMenuOpen = signal(false);

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

  readonly showHeader = computed(() => {
    const url = this.currentUrl();
    const excludedRoutes = ['/admin', '/login', '/register', '/forgot-password', '/reset-password'];
    return !excludedRoutes.some(route => url.startsWith(route));
  });

  readonly showFooter = computed(() => {
    const url = this.currentUrl();
    const excludedRoutes = ['/admin', '/login', '/register', '/forgot-password', '/reset-password'];
    return !excludedRoutes.some(route => url.startsWith(route));
  });

  readonly globalLoading = this.loadingService.isLoading;

  async ngOnInit(): Promise<void> {
    // Sync URL signal with router events
    this.router.events.subscribe(() => {
      this.currentUrl.set(this.router.url);
      this.isGlobalMenuOpen.set(false); // Close global menu on link click magically
    });

    // Load settings (badge image + theme) before anything else
    await this.appSettings.loadPublicSettings();

    const result = await this.session.hydrateSession();

    if (result === 'invalid-session') {
      await this.router.navigateByUrl('/');
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen.update((v) => !v);
  }

  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  toggleGlobalMenu(): void {
    this.isGlobalMenuOpen.update((v) => !v);
  }

  closeGlobalMenu(): void {
    this.isGlobalMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('#user-menu-button') && !target.closest('#user-dropdown')) {
      this.dropdownOpen.set(false);
    }
  }

  onLogout(): void {
    this.dropdownOpen.set(false);
    this.authApi.logout();
    this.session.clear();
    this.toast.showLogoutInfo();
    void this.router.navigateByUrl('/');
  }

  onSearch(): void {
    const query = this.searchQuery().trim();
    this.closeGlobalMenu(); // Close drawer on search
    
    if (query) {
      this.router.navigate(['/noticias'], { queryParams: { search: query } });
    } else {
      this.router.navigate(['/noticias']);
    }
  }
}
