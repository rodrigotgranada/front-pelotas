import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ActivityLog } from '../../../core/models/log.model';
import { ToastMessagesService, ToastTitle } from '../../../core/notifications/toast-messages.service';
import { LogsApiService } from '../../../core/services/logs-api.service';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-logs-page',
  standalone: true,
  imports: [SpinnerComponent, DatePipe, CommonModule, FormsModule],
  templateUrl: './logs-page.component.html',
  styleUrls: ['./logs-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogsPageComponent implements OnInit {
  private readonly logsApi = inject(LogsApiService);
  private readonly toast = inject(ToastMessagesService);
  private readonly auth = inject(AuthSessionService);

  readonly logs = signal<ActivityLog[]>([]);
  readonly loading = signal(false);
  readonly clearing = signal(false);

  // Filters
  readonly filterEntity = signal<string>('');
  readonly filterStatus = signal<string>('');
  readonly searchTerm = signal<string>('');
  private readonly searchDispatcher$ = new Subject<string>();

  readonly canClearLogs = signal(this.auth.me()?.roleCode === 'owner');

  private readonly actionMap: Record<string, string> = {
    'CREATE': 'Criação',
    'UPDATE': 'Atualização',
    'DELETE': 'Exclusão',
    'LOGIN': 'Acesso ao Sistema',
    'LOGOUT': 'Saída do Sistema',
    'UPLOAD_IMAGE': 'Upload de Mídia',
    'SUBSCRIBE': 'Inscrição Newsletter',
    'MEMBERSHIP.PLAN.CREATE': 'Novo Plano de Sócio',
    'MEMBERSHIP.PLAN.UPDATE': 'Plano de Sócio Atualizado',
    'MEMBERSHIP.PLAN.DELETE': 'Plano de Sócio Removido',
    'MEMBERSHIP.SUBSCRIPTION.ACTIVATE': 'Adesão de Sócio Concluída',
  };

  private readonly entityMap: Record<string, string> = {
    'News': 'Notícias',
    'User': 'Usuários',
    'Sponsor': 'Patrocinadores',
    'History': 'História',
    'Newsletter': 'Newsletter',
    'Auth': 'Segurança',
    'Athlete': 'Elenco',
    'Squad': 'Time/Temporada',
    'Idol': 'Ídolos',
    'Match': 'Jogos/Partidas',
    'membership-plan': 'Planos de Sócio',
    'membership-subscription': 'Assinaturas',
  };

  getFriendlyAction(action: string): string {
    return this.actionMap[action.toUpperCase()] || action;
  }

  getFriendlyEntity(entity: string): string {
    return this.entityMap[entity] || entity;
  }

  ngOnInit(): void {
    void this.loadLogs();

    this.searchDispatcher$
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((term) => {
        this.searchTerm.set(term);
        void this.loadLogs();
      });
  }

  onSearch(term: string): void {
    this.searchDispatcher$.next(term);
  }

  async loadLogs(): Promise<void> {
    this.loading.set(true);

    try {
      const query = {
        limit: 50,
        entity: this.filterEntity() || undefined,
        status: (this.filterStatus() as any) || undefined,
        // search: this.searchTerm() || undefined, // Backend filter to be implemented if needed
      };

      const logs = await firstValueFrom(this.logsApi.list(query));
      
      // If we have a local search term and backend doesn't support it yet
      let filtered = logs;
      if (this.searchTerm()) {
        const term = this.searchTerm().toLowerCase();
        filtered = logs.filter(l => 
          l.message?.toLowerCase().includes(term) || 
          l.action.toLowerCase().includes(term) ||
          l.actorEmail?.toLowerCase().includes(term)
        );
      }
      
      this.logs.set(filtered);
    } catch (error) {
      this.toast.showApiError(error, ToastTitle.LogsLoadFailure);
    } finally {
      this.loading.set(false);
    }
  }

  async clearHistory(): Promise<void> {
    if (!this.canClearLogs()) return;

    const confirmed = window.confirm(
      '⚠️ ATENÇÃO: Você está prestes a apagar TODO o histórico de auditoria do sistema. Esta ação não pode ser desfeita. Deseja continuar?'
    );

    if (!confirmed) return;

    this.clearing.set(true);
    try {
      await firstValueFrom(this.logsApi.clearAll());
      this.toast.showSuccess('Histórico de auditoria limpo com sucesso!', 'Limpeza de Logs');
      this.logs.set([]);
    } catch (error) {
      this.toast.showApiError(error, 'Erro ao limpar logs');
    } finally {
      this.clearing.set(false);
    }
  }
}
