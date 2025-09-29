import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';        // <-- agrega map

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
    return this.http.get<Player[]>(this.baseUrl).pipe(
      map((data) => {
        const arr = data ?? [];
        const seen = new Set<number | string>();
        const unique = arr.filter(p => {
          const key = p.id ?? `${p.fullName}|${p.number}|${p.teamId}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        // opcional: ordenar para una vista prolija
        unique.sort((a, b) =>
          (a.teamId - b.teamId) || (a.number - b.number) || a.fullName.localeCompare(b.fullName)
        );

        return unique;
      })
    );
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
