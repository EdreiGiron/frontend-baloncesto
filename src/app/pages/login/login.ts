import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  hidePassword = true;
  loading = false;
  mode: 'login' | 'register' = 'login';
  errorMsg = '';
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      username: [''], // usado solo en registro
    });
  }

  get emailCtrl()    { return this.form.get('email'); }
  get passwordCtrl() { return this.form.get('password'); }
  get usernameCtrl() { return this.form.get('username'); }

  switchMode(next: 'login' | 'register') {
    this.errorMsg = '';
    this.mode = next;
    if (next === 'register') {
      this.usernameCtrl?.addValidators([Validators.required, Validators.minLength(3)]);
    } else {
      this.usernameCtrl?.clearValidators();
    }
    this.usernameCtrl?.updateValueAndValidity();
  }

  onSubmit() {
    this.errorMsg = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password, username } = this.form.value;
    this.loading = true;

    if (this.mode === 'login') {
      this.auth.login(email, password)
        .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
        .subscribe({
          next: (res) => {
            this.auth.setToken(res.token);
            this.router.navigate(['/display']);
          },
          error: (err) => {
            this.errorMsg = this.mapError(err);
          }
        });
    } else {
      // Registro y auto-login
      this.auth.register({ email, password, username })
        .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
        .subscribe({
          next: () => {
            this.loading = true; // para la segunda llamada
            this.auth.login(email, password)
              .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
              .subscribe({
                next: (res) => {
                  this.auth.setToken(res.token);
                  this.router.navigate(['/display']);
                },
                error: (err) => { this.errorMsg = this.mapError(err); }
              });
          },
          error: (err) => { this.errorMsg = this.mapError(err); }
        });
    }
  }

  private mapError(err: any): string {
    const status = err?.status;
    if (status === 401) return 'No autorizado: credenciales inválidas.';
    if (status === 403) return 'No tienes permisos para acceder.';
    if (status === 400) return typeof err?.error === 'string' ? err.error : 'Solicitud inválida.';
    return typeof err?.error === 'string' ? err.error : 'Ocurrió un error. Intenta nuevamente.';
  }
}
