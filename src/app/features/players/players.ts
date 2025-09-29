import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Player {
  id?: number;
  fullName: string;
  number: number;
  position: string;
  height?: number;
  age?: number;
  nationality: string;
  teamId: number;
}

@Injectable({ providedIn: 'root' })
export class PlayersService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/Players'; 

  getPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(this.baseUrl);
  }

  getPlayer(id: number): Observable<Player> {
    return this.http.get<Player>(`${this.baseUrl}/${id}`);
  }

  createPlayer(payload: Player): Observable<Player> {
    return this.http.post<Player>(this.baseUrl, payload);
  }

  updatePlayer(id: number, payload: Player): Observable<Player> {
    return this.http.put<Player>(`${this.baseUrl}/${id}`, payload);
  }

  deletePlayer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
