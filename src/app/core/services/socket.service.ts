import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;
  private readonly matchUpdatedSubject = new Subject<any>();

  constructor() {
    // Extraímos o host da URL da API (removendo o /api do final se houver)
    const baseUrl = environment.apiBaseUrl.replace('/api', '');
    
    this.socket = io(`${baseUrl}/matches`, {
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('Connected to Matches WebSocket');
    });

    this.socket.on('match_updated', (data) => {
      this.matchUpdatedSubject.next(data);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Matches WebSocket');
    });
  }

  onMatchUpdated(): Observable<any> {
    return this.matchUpdatedSubject.asObservable();
  }
}
