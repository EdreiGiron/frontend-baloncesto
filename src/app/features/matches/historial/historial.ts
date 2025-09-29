import { Component, OnInit } from '@angular/core';
import { MatchesService, Match } from '../matches';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-matches-historial',
  standalone: true,
  imports: [CommonModule, DatePipe],  // 👈 agregado
  templateUrl: './historial.html',
  styleUrls: ['./historial.scss']
})
export class HistorialComponent implements OnInit {
  historial: Match[] = [];

  constructor(private matchesService: MatchesService) {}

  ngOnInit(): void {
    this.matchesService.getHistory().subscribe(data => this.historial = data);
  }
}
