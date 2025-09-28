import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Player {
  id?: number;
  fullName: string;
  number: number;
  position: string;
  height: number;
  age: number;
  nationality: string;
  teamId: number;
}

@Injectable({
  providedIn: 'root'
})
export class PlayersService {
  private apiUrl = 'http://localhost:5000/api/players'; // 👈 ajusta al puerto real de tu backend

  constructor(private http: HttpClient) {}

  getPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(this.apiUrl);
  }

  getPlayer(id: number): Observable<Player> {
    return this.http.get<Player>(`${this.apiUrl}/${id}`);
  }

  createPlayer(player: Player): Observable<Player> {
    return this.http.post<Player>(this.apiUrl, player);
  }

  updatePlayer(id: number, player: Player): Observable<Player> {
    return this.http.put<Player>(`${this.apiUrl}/${id}`, player);
  }

  deletePlayer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
