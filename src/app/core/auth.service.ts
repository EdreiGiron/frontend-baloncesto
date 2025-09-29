import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface LoginResponse { token: string; }

export interface RegisterDto {
  username: string;
  email: string;
  password: string;      
  role?: string;        
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);


  private readonly baseUrl = 'http://localhost:8080/api/auth';


  private key = 'auth_token';

  setToken(token: string) { localStorage.setItem(this.key, token); }
  getToken(): string | null { return localStorage.getItem(this.key); }
  clear() { localStorage.removeItem(this.key); }


  isLoggedIn(): boolean {
    const t = this.getToken();
    if (!t) return false;
    try {
      const payload = this.decode(t);
      const exp = payload?.exp ? Number(payload.exp) * 1000 : 0;
      return exp ? Date.now() < exp : true;
    } catch {
      return false;
    }
  }

  getRole(): string | null {
    const p = this.safePayload();
    if (!p) return null;
    return (
      p.role ||
      p.Role ||
      p['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      null
    );
  }

  getEmail(): string | null {
    const p = this.safePayload();
    return (p?.email || p?.Email || p?.sub || null);
  }

  getUsername(): string | null {
    const p = this.safePayload();
    return (p?.username || p?.Username || p?.name || null);
  }

  private safePayload(): any | null {
    const t = this.getToken();
    if (!t) return null;
    try { return this.decode(t); } catch { return null; }
  }

  private decode(token: string): any {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));

    return JSON.parse(decodeURIComponent(escape(json)));
  }


  login(email: string, password: string) {

    const body = { email, passwordHash: password };
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, body);
  }

  register(dto: RegisterDto) {

    const body = {
      username: dto.username,
      email: dto.email,
      passwordHash: dto.password,
      role: dto.role ?? 'Guest'
    };

    return this.http.post<string>(`${this.baseUrl}/register`, body, {
      responseType: 'text' as any
    });
  }

  logout() {
    this.clear();
    this.router.navigate(['/login']);
  }
}
