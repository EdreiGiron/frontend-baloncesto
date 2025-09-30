import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameSnapshot } from './matches';

@Injectable({
  providedIn: 'root'
})
export class MatchesService {
  private apiUrl = 'http://localhost:5000/api/game'; // usa /api/game
  constructor(private http: HttpClient) {}

  getHistory(): Observable<GameSnapshot[]> {
    return this.http.get<GameSnapshot[]>(`${this.apiUrl}/history`);
  }
}
