export type LogStatus = 'success' | 'failure';

export interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  status: LogStatus;
  flag?: string;
  actorUserId?: string;
  actorEmail?: string;
  ipAddress?: string;
  message?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface GetLogsQuery {
  action?: string;
  entity?: string;
  entityId?: string;
  status?: LogStatus;
  flag?: string;
  actorUserId?: string;
  from?: string;
  to?: string;
  limit?: number;
}
