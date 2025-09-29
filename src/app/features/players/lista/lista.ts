import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PlayersService, Player } from '../players';

@Component({
  selector: 'app-players-list',
  templateUrl: './lista.html',
  standalone: false,  
  styleUrls: ['./lista.scss']
})
export class ListaComponent implements OnInit {
  constructor(private players: PlayersService, private router: Router) {}

  cargando = signal(false);
  termino = '';
  jugadores: Player[] = [];   
  vista: Player[] = [];     

  ngOnInit(): void {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.players.getPlayers().subscribe({
      next: (data) => {
        this.jugadores = data ?? [];
        this.aplicarFiltro(this.termino);
      },
      complete: () => this.cargando.set(false),
    });
  }

  aplicarFiltro(txt: string) {
    this.termino = (txt ?? '').trim().toLowerCase();
    if (!this.termino) { this.vista = [...this.jugadores]; return; }
    this.vista = this.jugadores.filter(j =>
      (j.fullName ?? '').toLowerCase().includes(this.termino) ||
      (j.position ?? '').toLowerCase().includes(this.termino) ||
      String(j.number ?? '').includes(this.termino)
    );
  }

  limpiar() { this.aplicarFiltro(''); }

  nuevo()  { this.router.navigate(['/jugadores/nuevo']); }
  editar(id?: number)   { if (id != null) this.router.navigate(['/jugadores/editar', id]); }
  eliminar(id?: number) {
    if (id == null) return;
    if (!confirm('¿Eliminar jugador?')) return;
    this.players.deletePlayer(id).subscribe(() => this.cargar());
  }
}
