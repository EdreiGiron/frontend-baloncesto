import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlayersService, Player } from '../players';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.html',
  styleUrls: ['./lista.scss']
})
export class ListaComponent implements OnInit {
  jugadores: Player[] = [];

  constructor(private playersService: PlayersService, private router: Router) {}

  ngOnInit(): void {
    this.loadPlayers();
  }

  loadPlayers() {
    this.playersService.getPlayers().subscribe(players => this.jugadores = players);
  }

  editar(id: number) {
    this.router.navigate(['/players/editar', id]);
  }

  eliminar(id: number) {
    this.playersService.deletePlayer(id).subscribe(() => this.loadPlayers());
  }
}
