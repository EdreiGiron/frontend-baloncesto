import { Component, OnInit } from '@angular/core';
import { MatchesService } from '../matches.service';
import { GameSnapshot } from '../matches';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-matches-historial',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './historial.html',
  styleUrls: ['./historial.scss']
})
export class HistorialComponent implements OnInit {
  historial: GameSnapshot[] = [];

  constructor(private matchesService: MatchesService) {}

  ngOnInit(): void {
    this.matchesService.getHistory().subscribe(data => {
      this.historial = data;
    });
  }
}
