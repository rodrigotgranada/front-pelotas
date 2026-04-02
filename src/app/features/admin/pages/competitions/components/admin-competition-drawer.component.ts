import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, firstValueFrom } from 'rxjs';
import { Competition } from '../../../../../core/models/match.model';
import { MatchesApiService } from '../../../../../core/services/matches-api.service';
import { ToastMessagesService } from '../../../../../core/notifications/toast-messages.service';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { FallbackImgDirective } from '../../../../../shared/directives/fallback-img.directive';
import { compressImage } from '../../../../../shared/utils/image-compress.util';
import { AppSettingsService } from '../../../../../core/services/app-settings.service';

@Component({
  selector: 'app-admin-competition-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SpinnerComponent, FallbackImgDirective],
  template: `
    <div 
      class="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      [class.opacity-0.pointer-events-none]="!isOpen"
      (click)="close()"
    >
      <div 
        class="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 transform"
        [class.translate-x-full]="!isOpen"
        (click)="$event.stopPropagation()"
      >
        <div class="flex h-full flex-col">
          <!-- Header -->
          <header class="flex items-center justify-between border-b border-slate-100 p-6">
            <div>
              <h2 class="text-xl font-black text-slate-900 leading-tight">
                {{ competitionId ? 'Editar Campeonato' : 'Novo Campeonato' }}
              </h2>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão de Competições</p>
            </div>
            <button (click)="close()" class="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </header>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6 md:p-8">
            <form [formGroup]="form" class="space-y-8">
              <!-- Upload de Capa/Logo -->
              <div class="flex flex-col items-center gap-4 py-4">
                <div class="group relative h-40 w-full shrink-0 overflow-hidden rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 transition-all hover:border-indigo-400">
                  <img 
                    [src]="previewUrl() || appSettings.defaultCompetitionLogoUrl()" 
                    appFallbackImg="competition"
                    class="h-full w-full object-contain p-4 group-hover:scale-105 transition-transform"
                  />
                  
                  <label class="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-slate-900/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    <span class="mt-2 text-[10px] font-black uppercase tracking-widest text-white">Alterar Capa</span>
                    <input type="file" class="hidden" accept="image/*" (change)="onFileSelected($event)">
                  </label>

                  @if (uploading()) {
                    <div class="absolute inset-0 flex items-center justify-center bg-white/80">
                      <app-spinner size="sm" />
                    </div>
                  }
                </div>
                <div class="text-center">
                  <p class="text-xs font-black text-slate-900 uppercase tracking-tight">Imagem da Competição</p>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Recomendado: Logo ou Capa oficial</p>
                </div>
              </div>

              <div class="space-y-5">
                <div class="space-y-1.5">
                  <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Campeonato</label>
                  <input type="text" formControlName="name" class="w-full rounded-2xl border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 font-bold transition-all" placeholder="Ex: Gauchão Ipiranga 2024">
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Temporada</label>
                  <input type="text" formControlName="season" class="w-full rounded-2xl border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 font-bold transition-all" placeholder="Ex: 2024">
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Link Tabela Externa (FGF/GE)</label>
                  <input type="url" formControlName="externalTableUrl" class="w-full rounded-2xl border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 font-bold transition-all" placeholder="https://...">
                </div>

                <div class="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <input type="checkbox" formControlName="isActive" id="isActive" class="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500">
                  <label for="isActive" class="text-sm font-bold text-slate-700 cursor-pointer select-none">Campeonato em andamento (Ativo)</label>
                </div>
              </div>
            </form>
          </div>

          <!-- Footer -->
          <footer class="border-t border-slate-100 p-6 md:p-8 bg-slate-50/50">
            <button 
              (click)="save()" 
              [disabled]="form.invalid || loading() || uploading()"
              class="w-full rounded-2xl bg-indigo-600 py-4 text-sm font-black text-white shadow-xl shadow-indigo-900/20 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
            >
              @if (loading()) {
                <app-spinner label="Salvando..." size="sm" [inline]="true" />
              } @else {
                {{ competitionId ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR CAMPEONATO' }}
              }
            </button>
          </footer>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCompetitionDrawerComponent {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly matchesApi = inject(MatchesApiService);
  private readonly toast = inject(ToastMessagesService);
  protected readonly appSettings = inject(AppSettingsService);

  @Input() isOpen = false;
  @Input() competitionId: string | null = null;
  @Output() closed = new EventEmitter<Competition | null>();

  readonly loading = signal(false);
  readonly uploading = signal(false);
  readonly previewUrl = signal<string | null>(null);

  form = this.fb.group({
    name: ['', Validators.required],
    season: ['', Validators.required],
    externalTableUrl: [''],
    logoUrl: [''],
    isActive: [true]
  });

  @Input() set competition(data: Competition | null) {
    if (data) {
      this.competitionId = data.id;
      this.form.patchValue({
        name: data.name,
        season: data.season,
        externalTableUrl: data.externalTableUrl || '',
        logoUrl: data.logoUrl || '',
        isActive: data.isActive
      });
      this.previewUrl.set(data.logoUrl || null);
    } else {
      this.competitionId = null;
      this.form.reset({ isActive: true });
      this.previewUrl.set(null);
    }
  }

  close() {
    this.closed.emit(null);
  }

  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploading.set(true);
    try {
      const compressed = await compressImage(file, 800); // Competition covers can be a bit larger
      const { url } = await firstValueFrom(this.matchesApi.uploadCompetitionLogo(compressed));
      this.previewUrl.set(url);
      this.form.patchValue({ logoUrl: url });
      this.toast.showSuccess('Capa processada com sucesso!');
    } catch (error) {
      this.toast.showApiError(error, 'Erro ao processar imagem');
    } finally {
      this.uploading.set(false);
    }
  }

  save() {
    if (this.form.invalid) return;
    this.loading.set(true);

    const payload = this.form.getRawValue();
    const request = this.competitionId 
      ? this.matchesApi.updateCompetition(this.competitionId, payload)
      : this.matchesApi.createCompetition(payload);

    request.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (saved) => {
        this.toast.showSuccess(`Campeonato ${this.competitionId ? 'atualizado' : 'cadastrado'}!`);
        this.closed.emit(saved);
      },
      error: (err) => this.toast.showApiError(err, 'Erro ao salvar campeonato')
    });
  }
}
