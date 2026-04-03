import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PublicSettings {
  badgeUrl: string | null;
  themePreset: string;
  defaultNewsImageUrl: string | null;
  defaultTeamLogoUrl: string | null;
  defaultCompetitionLogoUrl: string | null;
  isMembershipEnabled: boolean;
  isSponsorsEnabled: boolean;
  isSquadsEnabled: boolean;
  isNewsletterEnabled: boolean;
  isIdolsEnabled: boolean;
  isMatchesEnabled: boolean;

  // Footer
  footerPhone?: string;
  footerIsWhatsapp?: boolean;
  footerEmail?: string;
  footerAddress?: string;
  footerMapsEmbedUrl?: string;
  footerSocialLinks?: string;
  footerLinks?: string;
  footerDevName?: string;
  footerDevUrl?: string;
  termsOfConduct?: string;
}

export interface PublicSocialLink {
  type: 'instagram' | 'facebook' | 'twitter' | 'youtube' | 'tiktok' | 'whatsapp' | 'other';
  url: string;
  label?: string;
}

export interface ThemePreset {
  id: string;
  label: string;
  colors: Record<string, string>;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'default',
    label: 'Padrão (Ciano)',
    colors: {
      '--theme-brand-50': '#ecfeff',
      '--theme-brand-100': '#cffafe',
      '--theme-brand-200': '#a5f3fc',
      '--theme-brand-300': '#67e8f9',
      '--theme-brand-400': '#22d3ee',
      '--theme-brand-500': '#06b6d4',
      '--theme-brand-600': '#0891b2',
      '--theme-brand-700': '#0e7490',
      '--theme-brand-800': '#155e75',
      '--theme-brand-900': '#164e63',
    },
  },
  {
    id: 'outubro-rosa',
    label: 'Outubro Rosa',
    colors: {
      '--theme-brand-50': '#fdf2f8',
      '--theme-brand-100': '#fce7f3',
      '--theme-brand-200': '#fbcfe8',
      '--theme-brand-300': '#f9a8d4',
      '--theme-brand-400': '#f472b6',
      '--theme-brand-500': '#ec4899',
      '--theme-brand-600': '#db2777',
      '--theme-brand-700': '#be185d',
      '--theme-brand-800': '#9d174d',
      '--theme-brand-900': '#831843',
    },
  },
  {
    id: 'novembro-azul',
    label: 'Novembro Azul',
    colors: {
      '--theme-brand-50': '#eff6ff',
      '--theme-brand-100': '#dbeafe',
      '--theme-brand-200': '#bfdbfe',
      '--theme-brand-300': '#93c5fd',
      '--theme-brand-400': '#60a5fa',
      '--theme-brand-500': '#3b82f6',
      '--theme-brand-600': '#2563eb',
      '--theme-brand-700': '#1d4ed8',
      '--theme-brand-800': '#1e40af',
      '--theme-brand-900': '#1e3a8a',
    },
  },
  {
    id: 'verde-esperanca',
    label: 'Verde Esperança',
    colors: {
      '--theme-brand-50': '#f0fdf4',
      '--theme-brand-100': '#dcfce7',
      '--theme-brand-200': '#bbf7d0',
      '--theme-brand-300': '#86efac',
      '--theme-brand-400': '#4ade80',
      '--theme-brand-500': '#22c55e',
      '--theme-brand-600': '#16a34a',
      '--theme-brand-700': '#15803d',
      '--theme-brand-800': '#166534',
      '--theme-brand-900': '#14532d',
    },
  },
];

@Injectable({ providedIn: 'root' })
export class AppSettingsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/settings`;

  readonly badgeUrl = signal<string | null>(null);
  readonly themePreset = signal<string>('default');
  readonly defaultNewsImageUrl = signal<string | null>(null);
  readonly defaultTeamLogoUrl = signal<string | null>(null);
  readonly defaultCompetitionLogoUrl = signal<string | null>(null);
  readonly isMembershipEnabled = signal<boolean>(true);
  readonly isSponsorsEnabled = signal<boolean>(true);
  readonly isSquadsEnabled = signal<boolean>(true);
  readonly isNewsletterEnabled = signal<boolean>(true);
  readonly isIdolsEnabled = signal<boolean>(true);
  readonly isMatchesEnabled = signal<boolean>(true);

  // Footer signals
  readonly footerPhone = signal<string>('');
  readonly footerIsWhatsapp = signal<boolean>(false);
  readonly footerEmail = signal<string>('');
  readonly footerAddress = signal<string>('');
  readonly footerMapsEmbedUrl = signal<string>('');
  readonly footerSocialLinks = signal<PublicSocialLink[]>([]);
  readonly footerLinks = signal<any[]>([]);
  readonly footerDevName = signal<string>('Rodrigo Granada');
  readonly footerDevUrl = signal<string>('https://www.linkedin.com/in/rtgranada-desenvolvedor/');
  readonly termsOfConduct = signal<string>('');

  async loadPublicSettings(): Promise<void> {
    try {
      const settings = await firstValueFrom(
        this.http.get<PublicSettings>(`${this.apiUrl}/public`),
      );
      this.badgeUrl.set(settings.badgeUrl || null);
      this.themePreset.set(settings.themePreset || 'default');
      this.defaultNewsImageUrl.set(settings.defaultNewsImageUrl || null);
      this.defaultTeamLogoUrl.set(settings.defaultTeamLogoUrl || null);
      this.defaultCompetitionLogoUrl.set(settings.defaultCompetitionLogoUrl || null);
      this.isMembershipEnabled.set(settings.isMembershipEnabled ?? true);
      this.isSponsorsEnabled.set(settings.isSponsorsEnabled ?? true);
      this.isSquadsEnabled.set(settings.isSquadsEnabled ?? true);
      this.isNewsletterEnabled.set(settings.isNewsletterEnabled ?? true);
      this.isIdolsEnabled.set(settings.isIdolsEnabled ?? true);
      this.isMatchesEnabled.set(settings.isMatchesEnabled ?? true);
      
      this.footerPhone.set(settings.footerPhone ?? '');
      this.footerIsWhatsapp.set(settings.footerIsWhatsapp ?? false);
      this.footerEmail.set(settings.footerEmail ?? '');
      this.footerAddress.set(settings.footerAddress ?? '');
      this.footerMapsEmbedUrl.set(settings.footerMapsEmbedUrl ?? '');
      try {
        this.footerSocialLinks.set(JSON.parse(settings.footerSocialLinks || '[]'));
      } catch {
        this.footerSocialLinks.set([]);
      }

      try {
        this.footerLinks.set(JSON.parse(settings.footerLinks || '[]'));
      } catch {
        this.footerLinks.set([]);
      }

      this.footerDevName.set(settings.footerDevName ?? 'Rodrigo Granada');
      this.footerDevUrl.set(settings.footerDevUrl ?? 'https://www.linkedin.com/in/rtgranada-desenvolvedor/');
      this.termsOfConduct.set(settings.termsOfConduct ?? '');

      this.applyTheme(settings.themePreset ?? 'default');
    } catch {
      // Silently fail — use defaults
    }
  }

  applyTheme(presetId: string): void {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const root = document.documentElement;
    Object.entries(preset.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }

  async saveSetting(key: string, value: string): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${this.apiUrl}`, { key, value }),
    );
  }
}
