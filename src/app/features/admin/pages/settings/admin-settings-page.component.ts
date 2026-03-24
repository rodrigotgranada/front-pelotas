import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppSettingsService, THEME_PRESETS } from '../../../../core/services/app-settings.service';
import { NewsApiService } from '../../../../core/services/news-api.service';
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';

@Component({
  selector: 'app-admin-settings-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto pb-20 flex flex-col gap-8">

      <!-- Header -->
      <div class="flex items-center gap-4">
        <a routerLink="/admin/dashboard" class="text-slate-500 hover:text-slate-900 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </a>
        <div>
          <h1 class="text-2xl font-black tracking-tight text-slate-900">Configurações do Portal</h1>
          <p class="text-sm text-slate-500 mt-0.5">Identidade visual e tema da campanha ativa</p>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button 
          (click)="activeTab.set('identidade')"
          [class]="activeTab() === 'identidade' 
            ? 'px-6 py-2 bg-white rounded-xl text-sm font-bold text-slate-900 shadow-sm' 
            : 'px-6 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition'"
        >
          Identidade
        </button>
        <button 
          (click)="activeTab.set('tema')"
          [class]="activeTab() === 'tema' 
            ? 'px-6 py-2 bg-white rounded-xl text-sm font-bold text-slate-900 shadow-sm' 
            : 'px-6 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition'"
        >
          Personalização
        </button>
      </div>

      <!-- Tab: Identidade Visual -->
      @if (activeTab() === 'identidade') {
        <div class="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Escudo do Clube</h2>
            </div>
            
            <div class="p-6">
              <div class="flex flex-col sm:flex-row gap-6 items-start">
                <div class="flex flex-col gap-2 items-center">
                  <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Distintivo atual</p>
                  <div class="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                    @if (badgeUrl()) {
                      <img [src]="badgeUrl()" alt="Distintivo" class="w-full h-full object-contain p-1" />
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-slate-300">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                      </svg>
                    }
                  </div>
                </div>

                <div class="flex-1 flex flex-col gap-4">
                  <div>
                    <p class="text-sm font-semibold text-slate-700 mb-1">Foto do Distintivo/Escudo</p>
                    <p class="text-xs text-slate-500">A imagem é enviada inteira (sem recorte) e redimensionada automaticamente. Recomendado PNG com fundo transparente.</p>
                  </div>

                  @if (!badgeUrl()) {
                    <label class="flex flex-col items-center justify-center w-full h-28 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                      <div class="flex flex-col items-center gap-2">
                        <svg class="w-7 h-7 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p class="text-xs text-slate-500"><span class="font-semibold">Clique para enviar o distintivo</span></p>
                        <p class="text-[10px] text-slate-400">PNG, JPG, WEBP — recomendado PNG com fundo transparente</p>
                      </div>
                      <input type="file" class="hidden" accept="image/png, image/jpeg, image/webp" (change)="onBadgeSelected($event)" />
                    </label>
                  } @else {
                    <div class="flex items-center gap-3">
                      <label class="cursor-pointer px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                        Trocar imagem
                        <input type="file" class="hidden" accept="image/png, image/jpeg, image/webp" (change)="onBadgeSelected($event)" />
                      </label>
                      <button type="button" (click)="removeBadge()" class="px-4 py-2 rounded-lg border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition">
                        Remover
                      </button>
                    </div>
                  }
                </div>
              </div>

              @if (badgeSaving()) {
                <div class="flex items-center gap-2 text-xs text-slate-500 mt-4">
                  <svg class="animate-spin h-4 w-4 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando distintivo...
                </div>
              }
            </div>
          </section>

          <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Imagem Padrão de Notícias</h2>
            </div>
            
            <div class="p-6">
              <div class="flex flex-col sm:flex-row gap-6 items-start">
                <div class="w-full sm:w-48 aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                   @if (defaultNewsUrl()) {
                      <img [src]="defaultNewsUrl()" alt="Default News" class="w-full h-full object-cover" />
                    } @else {
                      <div class="flex flex-col items-center gap-1 text-slate-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2Zm0-6 5-5 5 5 5-5 3 3"/></svg>
                        <span class="text-[10px] font-bold uppercase tracking-tighter">Sem Imagem</span>
                      </div>
                    }
                </div>
                <div class="flex-1 flex flex-col gap-3">
                  <p class="text-xs text-slate-500 leading-relaxed">
                    Esta imagem será exibida em todas as notícias que não possuírem uma imagem de capa definida. 
                    Recomendado: 1280x720px (16:9).
                  </p>
                  
                  <div class="flex items-center gap-3 mt-1">
                    <label class="cursor-pointer px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                      {{ defaultNewsUrl() ? 'Trocar Imagem' : 'Enviar Imagem' }}
                      <input type="file" class="hidden" accept="image/png, image/jpeg, image/webp" (change)="onDefaultNewsImageSelected($event)" />
                    </label>
                    @if (defaultNewsUrl()) {
                      <button type="button" (click)="removeDefaultNewsImage()" class="px-4 py-2 rounded-lg border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition">
                        Remover
                      </button>
                    }
                  </div>

                  @if (defaultNewsSaving()) {
                    <div class="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <svg class="animate-spin h-3.5 w-3.5 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando imagem padrão...
                    </div>
                  }
                </div>
              </div>
            </div>
          </section>
        </div>
      }

      <!-- Tab: Tema / Campanha -->
      @if (activeTab() === 'tema') {
        <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div class="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Tema da Campanha</h2>
            <p class="text-xs text-slate-500 mt-0.5">Altera a cor principal do portal em tempo real para todos os usuários</p>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              @for (preset of themePresets; track preset.id) {
                <button
                  type="button"
                  (click)="selectTheme(preset.id)"
                  [class]="selectedTheme() === preset.id
                    ? 'relative rounded-2xl border-2 border-brand-500 bg-brand-50 p-4 text-left transition shadow-md ring-2 ring-brand-200'
                    : 'relative rounded-2xl border-2 border-slate-200 bg-white p-4 text-left hover:border-slate-300 transition'"
                >
                  <div class="flex gap-1.5 mb-3">
                    @for (shade of getSwatches(preset); track shade) {
                      <div class="h-6 w-6 rounded-full shadow-sm border border-black/5 flex-shrink-0" [style.background]="shade"></div>
                    }
                  </div>
                  <p class="font-bold text-slate-900 text-sm">{{ preset.label }}</p>
                  @if (selectedTheme() === preset.id) {
                    <span class="absolute top-3 right-3 bg-brand-500 text-white rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </span>
                  }
                </button>
              }
            </div>

            <div class="mt-6 flex items-center justify-between">
              <p class="text-xs text-slate-500">
                Preview ao vivo — a alteração só será persistida após clicar em <strong>Salvar</strong>.
              </p>
              <button
                type="button"
                (click)="saveTheme()"
                [disabled]="themeSaving()"
                class="px-5 py-2 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                @if (themeSaving()) {
                  <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                } @else {
                  Salvar Tema
                }
              </button>
            </div>
          </div>
        </section>
      }
    </div>
  `,
})
export class AdminSettingsPageComponent implements OnInit {
  private readonly appSettings = inject(AppSettingsService);
  private readonly newsApi = inject(NewsApiService);
  private readonly toast = inject(ToastMessagesService);

  readonly themePresets = THEME_PRESETS;
  readonly badgeUrl = this.appSettings.badgeUrl;
  readonly defaultNewsUrl = this.appSettings.defaultNewsImageUrl;
  readonly selectedTheme = signal(this.appSettings.themePreset());

  readonly activeTab = signal<'identidade' | 'tema'>('identidade');
  readonly badgeSaving = signal(false);
  readonly defaultNewsSaving = signal(false);
  readonly themeSaving = signal(false);

  ngOnInit() {
    this.selectedTheme.set(this.appSettings.themePreset());
  }

  getSwatches(preset: (typeof THEME_PRESETS)[0]): string[] {
    return [
      preset.colors['--theme-brand-300'],
      preset.colors['--theme-brand-500'],
      preset.colors['--theme-brand-700'],
    ];
  }

  selectTheme(id: string) {
    this.selectedTheme.set(id);
    this.appSettings.applyTheme(id);
  }

  async saveTheme() {
    this.themeSaving.set(true);
    try {
      await this.appSettings.saveSetting('themePreset', this.selectedTheme());
      this.appSettings.themePreset.set(this.selectedTheme());
      this.toast.showSuccess('Tema salvo com sucesso!');
    } catch {
      this.toast.showError('Erro ao salvar o tema.');
    } finally {
      this.themeSaving.set(false);
    }
  }

  onBadgeSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = ''; // Reset so same file can be re-selected
    this.resizeAndUpload(file);
  }

  /**
   * Resizes the image to fit within 256×256 (preserving aspect ratio)
   * using a canvas, then uploads directly — no cropper needed for a badge/shield.
   */
  private resizeAndUpload(file: File): void {
    this.badgeSaving.set(true);

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const MAX = 256;
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);

      // Use PNG to preserve transparency (important for shields without background)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            this.toast.showError('Erro ao processar imagem.');
            this.badgeSaving.set(false);
            return;
          }
          this.uploadBadge(new File([blob], 'badge.png', { type: 'image/png' }));
        },
        'image/png',
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      this.toast.showError('Não foi possível carregar a imagem.');
      this.badgeSaving.set(false);
    };

    img.src = objectUrl;
  }

  private uploadBadge(file: File): void {
    this.newsApi.uploadImage(file).subscribe({
      next: async (res) => {
        if (res.success && res.file?.url) {
          try {
            await this.appSettings.saveSetting('badgeUrl', res.file.url);
            this.appSettings.badgeUrl.set(res.file.url);
            this.toast.showSuccess('Distintivo atualizado!');
          } catch {
            this.toast.showError('Erro ao salvar URL do distintivo.');
          }
        }
        this.badgeSaving.set(false);
      },
      error: () => {
        this.toast.showError('Erro ao enviar imagem.');
        this.badgeSaving.set(false);
      },
    });
  }

  async removeBadge() {
    this.badgeSaving.set(true);
    try {
      await this.appSettings.saveSetting('badgeUrl', '');
      this.appSettings.badgeUrl.set(null);
      this.toast.showSuccess('Distintivo removido.');
    } catch {
      this.toast.showError('Erro ao remover distintivo.');
    } finally {
      this.badgeSaving.set(false);
    }
  }

  onDefaultNewsImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';
    
    this.defaultNewsSaving.set(true);
    this.newsApi.uploadImage(file).subscribe({
      next: async (res) => {
        if (res.success && res.file?.url) {
          try {
            await this.appSettings.saveSetting('defaultNewsImageUrl', res.file.url);
            this.appSettings.defaultNewsImageUrl.set(res.file.url);
            this.toast.showSuccess('Imagem padrão de notícias atualizada!');
          } catch {
            this.toast.showError('Erro ao salvar URL da imagem padrão.');
          }
        }
        this.defaultNewsSaving.set(false);
      },
      error: () => {
        this.toast.showError('Erro ao enviar imagem.');
        this.defaultNewsSaving.set(false);
      },
    });
  }

  async removeDefaultNewsImage() {
    this.defaultNewsSaving.set(true);
    try {
      await this.appSettings.saveSetting('defaultNewsImageUrl', '');
      this.appSettings.defaultNewsImageUrl.set(null);
      this.toast.showSuccess('Imagem padrão removida.');
    } catch {
      this.toast.showError('Erro ao remover imagem padrão.');
    } finally {
      this.defaultNewsSaving.set(false);
    }
  }
}
