import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActivityLog, GetLogsQuery } from '../models/log.model';
import { withSkipGlobalLoading } from '../http/http-options.util';

@Injectable({ providedIn: 'root' })
export class LogsApiService {
  private readonly http = inject(HttpClient);

  list(query?: GetLogsQuery): Observable<ActivityLog[]> {
    let params = new HttpParams();

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null || value === '') {
          continue;
        }

        params = params.set(key, String(value));
      }
    }

    return this.http.get<ActivityLog[]>(
      `${environment.apiBaseUrl}/logs`,
      withSkipGlobalLoading({ params }),
    );
  }

  clearAll(): Observable<void> {
    return this.http.delete<void>(`${environment.apiBaseUrl}/logs`);
  }
}
