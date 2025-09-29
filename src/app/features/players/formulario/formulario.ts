import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayersService, Player } from '../players';

@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.html',
  standalone: false,
  styleUrls: ['./formulario.scss']
})
export class FormularioComponent implements OnInit {
  jugador: Player = {
    fullName: '',
    number: 0,
    position: '',
    height: undefined,
    age: undefined,
    nationality: '',
    teamId: 0,
  };
  id?: number;

  constructor(
    private playersService: PlayersService,
    private route: ActivatedRoute,
    public router: Router
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.params['id'];
    this.id = idParam ? Number(idParam) : undefined;
    if (this.id) {
      this.playersService.getPlayer(this.id).subscribe(p => this.jugador = p);
    }
  }

  saving = false;
  errorMsg = '';

  guardar() {
    this.errorMsg = '';
    this.saving = true;

    const payload: Player = {
      ...this.jugador,
      teamId: Number(this.jugador.teamId),
      number: Number(this.jugador.number),
      height: this.jugador.height != null ? Number(this.jugador.height) : undefined,
      age: this.jugador.age != null ? Number(this.jugador.age) : undefined,
    };

    const req$ = this.id
      ? this.playersService.updatePlayer(this.id, payload)
      : this.playersService.createPlayer(payload);

    req$.subscribe({
      next: () => this.router.navigate(['/jugadores']),
      error: (err) => {
        this.saving = false;
        console.error('Guardar jugador - error', err);
        this.errorMsg =
          (err?.error?.message || err?.error) ??
          `Error al guardar (status ${err?.status ?? 'desconocido'})`;
        alert(this.errorMsg); // opcional, para que no pase desapercibido
      }
    });
  }
}