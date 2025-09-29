import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatchesService, Match } from '../matches';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-matches-lista',
  standalone: true,
  imports: [CommonModule, DatePipe],  // 👈 agregado
  templateUrl: './lista.html',
  styleUrls: ['./lista.scss']
})
export class ListaComponent implements OnInit {
  matches: Match[] = [];

  constructor(private matchesService: MatchesService, private router: Router) {}

  ngOnInit(): void {
    this.loadMatches();
  }

  loadMatches() {
    this.matchesService.getMatches().subscribe(data => this.matches = data);
  }

  editar(id: number) {
    this.router.navigate(['/partidos/editar', id]);
  }

  eliminar(id: number) {
    this.matchesService.deleteMatch(id).subscribe(() => this.loadMatches());
  }
}
