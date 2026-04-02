import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { Sponsor } from '../../../../core/models/sponsor.model';
import { SponsorsService } from '../../../../core/services/sponsors.service';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { finalize } from 'rxjs';
import { AdminCreateSponsorDrawerComponent } from './components/admin-create-sponsor-drawer.component';

@Component({
  selector: 'app-admin-sponsors-page',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, AdminCreateSponsorDrawerComponent],
  template: `
    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-black tracking-tight text-slate-900">Patrocinadores</h1>
          <p class="text-sm text-slate-500">Gerencie os parceiros e patrocinadores exibidos na Home</p>
        </div>
        <button
          (click)="openCreateDrawer()"
          class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700"
        >
          Novo Patrocinador
        </button>
      </div>

      <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        @if (loading()) {
          <div class="flex items-center justify-center p-12">
            <app-spinner label="Carregando patrocinadores..." size="md" />
          </div>
        } @else {
          <table class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th class="px-6 py-4">Logo</th>
                <th class="px-6 py-4">Patrocinador</th>
                <th class="px-6 py-4">Ordem</th>
                <th class="px-6 py-4">Vencimento</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              @for (item of sponsors(); track item._id) {
                <tr class="transition hover:bg-slate-50">
                  <td class="px-6 py-4">
                    <div class="h-10 w-24 shrink-0 rounded border border-slate-200 bg-white overflow-hidden p-1 flex items-center justify-center">
                      <img [src]="item.logoUrl" alt="logo" class="max-h-full max-w-full object-contain" />
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="font-medium text-slate-900">{{ item.name }}</div>
                    @if (item.websiteUrl) {
                      <a [href]="item.websiteUrl" target="_blank" class="text-xs text-indigo-500 hover:text-indigo-700 hover:underline">{{ item.websiteUrl }}</a>
                    }
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                       <span class="font-semibold text-slate-700">{{ item.order }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    @if (item.expirationDate) {
                      <div class="flex flex-col gap-1">
                        <span [class]="isExpired(item) ? 'text-rose-600 font-bold' : ''">
                          {{ item.expirationDate | date:'dd/MM/yyyy' }}
                        </span>
                        @if (isExpired(item)) {
                          <span class="inline-flex items-center rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20 w-fit">Expirado</span>
                        }
                      </div>
                    } @else {
                      <span class="text-slate-300">Sem prazo</span>
                    }
                  </td>
                  <td class="px-6 py-4">
                    @if (item.isActive) {
                      <span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                        Ativo
                      </span>
                    } @else {
                      <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800">
                        Inativo
                      </span>
                    }
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button (click)="openEditDrawer(item)" class="text-indigo-600 hover:text-indigo-900 font-semibold transition px-2 py-1">Editar</button>
                      <button (click)="removeSponsor(item._id)" class="text-rose-500 hover:text-rose-700 font-semibold transition px-2 py-1">Excluir</button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="p-8 text-center text-slate-500">Nenhum patrocinador cadastrado ainda.</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>

    @if (isDrawerOpen()) {
      <app-admin-create-sponsor-drawer
        [sponsorToEdit]="selectedSponsor()"
        (close)="closeDrawer()"
        (saved)="onSaved()"
      />
    }
  `,
})
export class AdminSponsorsPageComponent implements OnInit {
  private readonly sponsorsService = inject(SponsorsService);

  readonly loading = signal(false);
  readonly sponsors = signal<Sponsor[]>([]);
  
  readonly isDrawerOpen = signal(false);
  readonly selectedSponsor = signal<Sponsor | null>(null);

  isExpired(sponsor: Sponsor): boolean {
    if (!sponsor.expirationDate) return false;
    return new Date(sponsor.expirationDate) < new Date();
  }

  ngOnInit() {
    this.loadSponsors();
  }

  loadSponsors() {
    this.loading.set(true);
    this.sponsorsService.findAllAdmin()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((data) => this.sponsors.set(data));
  }

  openCreateDrawer() {
    this.selectedSponsor.set(null);
    this.isDrawerOpen.set(true);
  }

  openEditDrawer(sponsor: Sponsor) {
    this.selectedSponsor.set(sponsor);
    this.isDrawerOpen.set(true);
  }

  closeDrawer() {
    this.isDrawerOpen.set(false);
    this.selectedSponsor.set(null);
  }

  onSaved() {
    this.closeDrawer();
    this.loadSponsors();
  }

  removeSponsor(id: string) {
    if (confirm('Tem certeza que deseja excluir este patrocinador?')) {
      this.sponsorsService.remove(id).subscribe(() => {
        this.loadSponsors();
      });
    }
  }
}
