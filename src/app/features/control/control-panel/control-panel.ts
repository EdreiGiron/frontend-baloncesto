import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameStore, TeamKey } from '../../../core/game-store';

@Component({
  standalone: true,
  selector: 'app-control-panel',
  imports: [FormsModule],
  templateUrl: './control-panel.html',
  styleUrls: ['./control-panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlPanelComponent {
  private s = inject(GameStore);

  home = this.s.home; away = this.s.away;
  quarter = this.s.quarter; timeLabel = this.s.timeLabel;
  bonusHome = this.s.bonusHome; bonusAway = this.s.bonusAway;
  possession = this.s.possession; timeoutLabel = this.s.timeoutLabel;

  minutes = 10;

  setNames(h: string, a: string) { this.s.setTeamName('home', h); this.s.setTeamName('away', a); }
  add(t: TeamKey, p: 1|2|3) { this.s.addPoints(t, p); }
  sub(t: TeamKey) { this.s.removePoint(t); }
  foul(t: TeamKey) { this.s.addFoul(t); }
  resetFouls() { this.s.resetFouls(); }

  start() { this.s.start(); }
  pause() { this.s.pause(); }
  resetClock() { this.s.resetClock(); }
  setMinutes() { this.s.setQuarterMinutes(this.minutes); }

  nextQuarter() { this.s.nextQuarter(); }
  setQuarter(q: 1|2|3|4) { this.s.setQuarter(q); }

  setPos(v: TeamKey | null) { this.s.setPossession(v); }
  callTO(t: TeamKey, secs: 30|60) { this.s.callTimeout(t, secs); }

  resetAll() { this.s.resetAll(); }
}
