import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Team {
  id: number;
  name: string;
  city: string;
  logoUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class TeamsService {
  private http = inject(HttpClient);

  private readonly baseUrl = '/api/teams';

  getAll(term?: string): Observable<Team[]> {
    let params = new HttpParams();

    if (term && term.trim()) params = params.set('q', term.trim());

    return this.http.get<Team[]>(this.baseUrl, { params }).pipe(map(x => x ?? []));
  }

  getById(id: number): Observable<Team> {
    return this.http.get<Team>(`${this.baseUrl}/${id}`);
  }

  create(payload: Omit<Team, 'id'>) {
    return this.http.post<Team>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Omit<Team, 'id'>>) {
    return this.http.put<Team>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
