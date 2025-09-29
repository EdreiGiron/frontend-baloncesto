import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamsService, Team } from '../../core/teams.service';
import { AuthService } from '../../core/auth.service';

type TeamForm = { name: string; city: string; logoUrl?: string };

@Component({
  standalone: true,
  selector: 'app-teams-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './teams-list.html',
  styleUrls: ['./teams-list.scss']
})
export class TeamsListComponent implements OnInit {
  constructor(private teams: TeamsService, private auth: AuthService) {}

  // estado de lista/filtro
  cargando = signal<boolean>(false);
  term = signal<string>('');
  raw: Team[] = [];
  view: Team[] = [];

  // estado de formulario inline (crear/editar)
  showForm = signal<boolean>(false);
  editingId = signal<number | null>(null);
  form: TeamForm = { name: '', city: '', logoUrl: '' };
  saving = signal<boolean>(false);
  errorMsg = signal<string>('');

  isAdmin() { return this.auth.getRole() === 'Admin'; }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.cargando.set(true);
    this.teams.getAll().subscribe({
      next: data => {
        this.raw = data ?? [];
        this.applyFilter(this.term());
      },
      error: err => {
        console.error('Equipos → error', err);
        this.raw = [];
        this.view = [];
      },
      complete: () => this.cargando.set(false)
    });
  }

  applyFilter(value: string) {
    this.term.set(value ?? '');
    const f = this.term().trim().toLowerCase();
    if (!f) { this.view = [...this.raw]; return; }
    this.view = this.raw.filter(t =>
      (t.name?.toLowerCase().includes(f)) || (t.city?.toLowerCase().includes(f))
    );
  }
  clear() { this.applyFilter(''); }

  // ---- CRUD UI ----
  openCreate() {
    if (!this.isAdmin()) return;
    this.editingId.set(null);
    this.form = { name: '', city: '', logoUrl: '' };
    this.errorMsg.set('');
    this.showForm.set(true);
  }

  openEdit(team: Team) {
    if (!this.isAdmin()) return;
    this.editingId.set(team.id);
    this.form = { name: team.name, city: team.city, logoUrl: team.logoUrl };
    this.errorMsg.set('');
    this.showForm.set(true);
  }

  cancel() {
    this.showForm.set(false);
    this.editingId.set(null);
    this.errorMsg.set('');
  }

  save() {
    if (!this.isAdmin()) return;
    const dto: TeamForm = {
      name: this.form.name?.trim(),
      city: this.form.city?.trim(),
      logoUrl: (this.form.logoUrl || '').trim() || undefined
    };
    if (!dto.name || !dto.city) {
      this.errorMsg.set('Nombre y Ciudad son obligatorios.');
      return;
    }

    this.saving.set(true);
    this.errorMsg.set('');

    const id = this.editingId();
    const req = id == null
      ? this.teams.create(dto)
      : this.teams.update(id, dto);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.editingId.set(null);
        this.load();
      },
      error: err => {
        console.error('Guardar equipo', err);
        const msg = (typeof err?.error === 'string') ? err.error : 'No se pudo guardar el equipo.';
        this.errorMsg.set(msg);
        this.saving.set(false);
      }
    });
  }

  remove(team: Team) {
    if (!this.isAdmin()) return;
    if (!confirm(`¿Eliminar el equipo "${team.name}"?`)) return;
    this.teams.delete(team.id).subscribe({
      next: () => this.load(),
      error: err => console.error('Eliminar equipo', err)
    });
  }
}
