import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent {
  private router = inject(Router);
  private auth = inject(AuthService);

  private currentUrl = signal(this.router.url);

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.currentUrl.set(e.urlAfterRedirects ?? e.url));
  }

  // Navbar oculto en /login
  showNavbar = computed(() => !this.currentUrl().startsWith('/login'));

  // Sesión / rol (usados en app.html)
  isLoggedIn = () => this.auth.isLoggedIn();
  isAdmin    = () => this.auth.getRole() === 'Admin';
  username   = () => this.auth.getUsername();

  logout() { this.auth.logout(); }
}
