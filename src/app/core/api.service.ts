import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {
  base = 'http://localhost:5000/api';
  constructor(private http: HttpClient) {}
  save(game: any) { return this.http.post(`${this.base}/game/save`, game); }
}
