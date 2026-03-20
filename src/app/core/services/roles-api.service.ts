import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { skipGlobalLoadingContext } from '../http/http-options.util';
import { RoleResponse } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RolesApiService {
  private readonly http = inject(HttpClient);

  listActive(): Observable<RoleResponse[]> {
    return this.http.get<RoleResponse[]>(`${environment.apiBaseUrl}/roles`, skipGlobalLoadingContext());
  }
}
