import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatchesService, Match } from '../matches';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-matches-formulario',
  standalone: true,
  imports: [CommonModule, FormsModule],  // 👈 agregado
  templateUrl: './formulario.html',
  styleUrls: ['./formulario.scss']
})
export class FormularioComponent implements OnInit {
  match: Match = {
    matchDate: '',
    homeTeamId: 0,
    awayTeamId: 0
  };
  id?: number;

  constructor(
    private matchesService: MatchesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    if (this.id) {
      this.matchesService.getMatch(this.id).subscribe(data => this.match = data);
    }
  }

  guardar() {
    if (this.id) {
      this.matchesService.updateMatch(this.id, this.match).subscribe(() => this.router.navigate(['/partidos']));
    } else {
      this.matchesService.createMatch(this.match).subscribe(() => this.router.navigate(['/partidos']));
    }
  }

  cancelar() {
    this.router.navigate(['/partidos']); // 👈 método público
  }
}
