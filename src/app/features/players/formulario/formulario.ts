import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayersService, Player } from '../players';

@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.html',
  styleUrls: ['./formulario.scss']
})
export class FormularioComponent implements OnInit {
  jugador: Player = {
    fullName: '',
    number: 0,
    position: '',
    height: 0,
    age: 0,
    nationality: '',
    teamId: 0
  };
  id?: number;

  constructor(
    private playersService: PlayersService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    if (this.id) {
      this.playersService.getPlayer(this.id).subscribe(data => this.jugador = data);
    }
  }

  guardar() {
    if (this.id) {
      this.playersService.updatePlayer(this.id, this.jugador)
        .subscribe(() => this.router.navigate(['/players']));
    } else {
      this.playersService.createPlayer(this.jugador)
        .subscribe(() => this.router.navigate(['/players']));
    }
  }
}
