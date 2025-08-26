import { ChangeDetectionStrategy, Component, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { GameStore } from '../../core/game-store';
import { RealtimeService } from '../../core/realtime.service';

@Component({
  standalone: true,
  selector: 'app-display',
  templateUrl: './display.html',
  styleUrls: ['./display.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayComponent implements OnInit, OnDestroy {
  private s = inject(GameStore);
  constructor(private rt: RealtimeService) {}

  ngOnInit() { void this.rt.connect('http://localhost:5000'); }
  ngOnDestroy() { void this.rt.disconnect(); }

  home = this.s.home; away = this.s.away;
  quarter = this.s.quarter;
  timeLabel = this.s.timeLabel;
  running = this.s.running;
  bonusHome = this.s.bonusHome; bonusAway = this.s.bonusAway;
  possession = this.s.possession;
  timeoutLabel = this.s.timeoutLabel;
  timeoutLeftMs = this.s.timeoutLeftMs;
  timeoutBy = this.s.timeoutBy;

  homeName = computed(() => this.home().name?.trim() || 'LOCAL');
  awayName = computed(() => this.away().name?.trim() || 'VISITA');
}
