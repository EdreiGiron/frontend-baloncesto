import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent {
  private router = inject(Router);
  private auth = inject(AuthService);

  // Ocultar navbar en /login
  private currentUrl = signal(this.router.url);
  readonly hidden = computed(() => this.currentUrl().startsWith('/login'));

  // Sesión/rol
  readonly logged = computed(() => this.auth.isLoggedIn());
  readonly role = computed(() => this.auth.getRole()); // 'Admin' | 'User' | 'Guest' | null

  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.currentUrl.set(e.urlAfterRedirects || e.url));
  }

  logout() {
    this.auth.logout();
  }
}
