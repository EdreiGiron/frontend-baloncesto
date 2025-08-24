import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { GameStore } from '../../core/game-store';

@Component({
  standalone: true,
  selector: 'app-display',
  templateUrl: './display.html',
  styleUrls: ['./display.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayComponent {
  private s = inject(GameStore);
  home = this.s.home; away = this.s.away;
  quarter = this.s.quarter;
  timeLabel = this.s.timeLabel;
  running = this.s.running;
  bonusHome = this.s.bonusHome; bonusAway = this.s.bonusAway;
  possession = this.s.possession;
  timeoutLabel = this.s.timeoutLabel;
}
