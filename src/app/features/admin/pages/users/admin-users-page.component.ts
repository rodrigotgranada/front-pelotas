import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { UsersApiService } from '../../../../core/services/users-api.service';
import { ToastMessagesService, ToastTitle } from '../../../../core/notifications/toast-messages.service';
import { PaginatedUsersResponse, UserResponse } from '../../../../core/models/user.model';
import { AdminCreateUserDrawerComponent } from './admin-create-user-drawer.component';
import { AdminUserDrawerComponent } from './admin-user-drawer.component';
import { AuthSessionService } from '../../../../core/auth/auth-session.service';
import { DeleteUserModalComponent } from './delete-user-modal.component';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent, AdminCreateUserDrawerComponent, AdminUserDrawerComponent, DeleteUserModalComponent],
  template: `
    <div class="space-y-6">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 class="text-3xl font-black tracking-tight text-slate-900">Gestão de Usuarios</h1>
          <p class="mt-2 text-slate-600">Verifique e gerencie cargos, acessos e os clientes da plataforma.</p>
        </div>
        
        <button
          type="button"
          (click)="showCreateDrawer.set(true)"
          class="inline-flex items-center justify-center rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          Adicionar Membro
        </button>
      </header>
      
      <div class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <!-- Toolbar -->
        <div class="border-b border-slate-200 bg-slate-50/50 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <input 
            type="text" 
            [formControl]="searchControl"
            placeholder="Buscar por nome, e-mail ou CPF..." 
            class="w-full sm:max-w-sm rounded-lg border-slate-300 px-4 py-2 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
          />
          
          <select [formControl]="roleFilterControl" class="w-full sm:max-w-xs rounded-lg border-slate-300 px-4 py-2 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500 bg-white cursor-pointer">
            <option [ngValue]="null">Todos os cargos</option>
            <option value="owner">Owner</option>
            <option value="socio">Sócio</option>
            <option value="admin">Administrador</option>
            <option value="editor">Editor</option>
            <option value="user">Cliente comum</option>
          </select>

          <select [formControl]="statusFilterControl" class="w-full sm:max-w-xs rounded-lg border-slate-300 px-4 py-2 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500 bg-white cursor-pointer">
            <option [ngValue]="null">Status: Todos</option>
            <option [ngValue]="true">Ativos</option>
            <option [ngValue]="false">Inativos</option>
          </select>
        </div>
        
        <!-- Table -->
        <div class="overflow-x-auto relative">
          @if (loading()) {
            <div class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm min-h-[300px]">
              <app-spinner size="lg"></app-spinner>
            </div>
          }

          <table class="min-w-full divide-y divide-slate-200 text-sm text-left whitespace-nowrap">
            <thead class="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th scope="col" class="px-6 py-4">Usuario</th>
                <th scope="col" class="px-6 py-4">Documento</th>
                <th scope="col" class="px-6 py-4">Cargo</th>
                <th scope="col" class="px-6 py-4">Status</th>
                <th scope="col" class="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              @for (user of usersData()?.data; track user.id) {
                <tr class="transition hover:bg-slate-50 cursor-pointer" (click)="openUserDrawer(user)">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-300 bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                        @if (user.photoUrl) {
                          <img [src]="user.photoUrl" class="h-full w-full object-cover" />
                        } @else {
                          {{ user.firstName.charAt(0) }}
                        }
                      </div>
                      <div class="flex flex-col">
                        <span class="font-medium text-slate-900">{{ user.firstName }} {{ user.lastName }}</span>
                        <span class="text-xs text-slate-500">{{ user.email }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-slate-600 font-mono text-xs">{{ user.document | slice:0:3 }}.***.***-**</td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold capitalize bg-slate-100 text-slate-700">
                      {{ user.roleCode || 'Cliente' }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    @if (user.status === 'active') {
                      <span class="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Ativo</span>
                    } @else if (user.status === 'suspended') {
                      <span class="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20" [title]="user.statusReason || ''">Suspenso</span>
                    } @else {
                      <span class="inline-flex items-center rounded-md bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">Inativo</span>
                    }
                  </td>
                  <td class="px-6 py-4 text-right">
                    @if (user.roleCode !== 'owner') {
                      <div class="flex items-center justify-end gap-2">
                        <!-- Edit Button -->
                        <button 
                          (click)="$event.stopPropagation(); openEditDrawer(user)"
                          class="text-indigo-400 hover:text-indigo-600 transition p-2 rounded-lg hover:bg-indigo-50"
                          title="Editar usuario"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </button>
                        
                        @if (user.isActive) {
                          <button 
                            (click)="$event.stopPropagation(); openDeleteModal(user)"
                            class="text-rose-400 hover:text-rose-600 transition p-2 rounded-lg hover:bg-rose-50"
                            title="Desligar/Excluir usuario"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                          </button>
                        } @else {
                          <button 
                            (click)="$event.stopPropagation(); reactivateUser(user)"
                            class="text-emerald-500 hover:text-emerald-700 transition p-2 rounded-lg hover:bg-emerald-50"
                            title="Reativar usuario"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                          </button>
                        }
                      </div>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                    Nenhum usuario listado no momento.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        @if (usersData(); as data) {
          <div class="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
            <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-slate-700">
                  Mostrando <span class="font-semibold">{{ data.data.length }}</span> resultados de <span class="font-semibold">{{ data.total }}</span> totais.
                </p>
              </div>
              <div>
                <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button 
                    [disabled]="data.page <= 1"
                    (click)="changePage(data.page - 1)"
                    class="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span class="sr-only">Anterior</span>
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" /></svg>
                  </button>
                  <button 
                    [disabled]="data.page >= data.totalPages"
                    (click)="changePage(data.page + 1)"
                    class="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span class="sr-only">Próxima</span>
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" /></svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        }
      </div>
      
      @if (showCreateDrawer() || userToEdit()) {
        <app-admin-create-user-drawer
          [editUser]="userToEdit()"
          (close)="showCreateDrawer.set(false); userToEdit.set(null)"
          (saved)="onModalSaved()"
        />
      }

      @if (selectedUser()) {
        <app-admin-user-drawer
          [user]="selectedUser()!"
          (close)="selectedUser.set(null)"
          (userUpdated)="onUserUpdated()"
        />
      }

      <!-- Modal de Exclusão Customizada -->
      @if (userToDelete()) {
        <app-delete-user-modal
          [user]="userToDelete()!"
          (close)="closeDeleteModal()"
          (deleted)="onUserDeleted()"
        />
      }

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersPageComponent implements OnInit {
  private readonly usersService = inject(UsersApiService);
  private readonly toastService = inject(ToastMessagesService);
  private readonly destroyRef = inject(DestroyRef);
  readonly session = inject(AuthSessionService);

  readonly searchControl = new FormControl<string>('');
  readonly roleFilterControl = new FormControl<string | null>(null);
  readonly statusFilterControl = new FormControl<boolean | null>(null);

  readonly loading = signal<boolean>(true);
  readonly showCreateDrawer = signal<boolean>(false);
  readonly userToEdit = signal<UserResponse | null>(null);
  readonly selectedUser = signal<UserResponse | null>(null);
  
  // Custom Modal States
  readonly userToDelete = signal<UserResponse | null>(null);
  readonly deleteConfirmText = signal<string>('');

  readonly usersData = signal<PaginatedUsersResponse | null>(null);
  
  private currentPage = 1;
  private currentLimit = 10;

  ngOnInit(): void {
    this.setupFilters();
    this.fetchUsers();
  }

  private setupFilters(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.fetchUsers();
      });

    this.roleFilterControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.currentPage = 1;
        this.fetchUsers();
      });

    this.statusFilterControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.currentPage = 1;
        this.fetchUsers();
      });
  }

  changePage(newPage: number): void {
    const data = this.usersData();
    if (!data) return;
    if (newPage >= 1 && newPage <= data.totalPages) {
      this.currentPage = newPage;
      this.fetchUsers();
    }
  }

  fetchUsers(): void {
    this.loading.set(true);
    
    this.usersService.list({
      search: this.searchControl.value || undefined,
      role: this.roleFilterControl.value || undefined,
      isActive: this.statusFilterControl.value !== null ? this.statusFilterControl.value : undefined,
      page: this.currentPage,
      limit: this.currentLimit,
    }).subscribe({
      next: (response) => {
        this.usersData.set(response);
        this.loading.set(false);
      },
      error: () => {
         // handle error silently for now, spinner disappears
         this.loading.set(false);
      }
    });
  }

  openEditDrawer(user: UserResponse) {
    this.userToEdit.set(user);
    this.selectedUser.set(null); // close detail drawer if open
  }

  onModalSaved(): void {
    this.showCreateDrawer.set(false);
    this.userToEdit.set(null);
    this.currentPage = 1;
    this.fetchUsers();
  }

  openDeleteModal(user: UserResponse): void {
    this.userToDelete.set(user);
    this.deleteConfirmText.set('');
  }

  closeDeleteModal(): void {
    this.userToDelete.set(null);
    this.deleteConfirmText.set('');
  }

  onUserDeleted(): void {
    this.closeDeleteModal();
    this.fetchUsers();
  }

  reactivateUser(user: UserResponse): void {
    if (confirm(`Tem certeza que deseja reativar o usuario ${user.firstName} ${user.lastName}? O acesso dele sera restabelecido.`)) {
      this.loading.set(true);
      this.usersService.reactivate(user.id).subscribe({
        next: () => {
          this.toastService.showSuccess('Usuario reativado com sucesso.', 'Sucesso');
          this.fetchUsers();
        },
        error: (err) => {
          this.toastService.showApiError(err, 'Falha ao reativar');
          this.loading.set(false);
        }
      });
    }
  }

  openUserDrawer(user: UserResponse): void {
    this.selectedUser.set(user);
  }

  onUserUpdated(): void {
    this.fetchUsers();
    // Close the drawer or let it stay open? Better to close since object might be stale 
    // or just fetch list and let it stay open. Let's just fetch the list, which keeps the drawer open with outdated object,
    // wait, if we keep it open, the object passed to it won't update automatically unless we fetch the single user.
    // So let's close the drawer.
    this.selectedUser.set(null);
  }
}
