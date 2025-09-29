import { ChangeDetectionStrategy, Component, computed, inject, OnInit, OnDestroy, signal, effect } from '@angular/core';
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
  constructor(private rt: RealtimeService) { }

  ngOnInit() { void this.rt.connect('http://localhost:8080'); }
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

  showQuarterBanner = signal(false);
  endedQuarter = signal<1 | 2 | 3 | 4>(1);
  bannerText = computed(() => this.endedQuarter() === 4 ? 'FIN DEL PARTIDO' : `FIN Q${this.endedQuarter()}`);
  private _prevQuarter = this.quarter();
  private quarterChangeEffect = effect(() => {
    const q = this.quarter();

    const autoBetween = (q > this._prevQuarter) && !this.running() && (this.s.timeLeftMs() === this.s.quarterDurationMs());
    if (autoBetween) {
      this.endedQuarter.set(this._prevQuarter as 1 | 2 | 3 | 4);
      this.showQuarterBanner.set(true);
      setTimeout(() => this.showQuarterBanner.set(false), 2500);
    }
    this._prevQuarter = q;
  });

  private _prevTimeLeft = this.s.timeLeftMs();
  private finalGameEffect = effect(() => {
    const tl = this.s.timeLeftMs();
    const isEndQ4 = this.quarter() === 4 && !this.running() && this._prevTimeLeft > 0 && tl === 0;
    if (isEndQ4) {
      this.endedQuarter.set(4);
      this.showQuarterBanner.set(true);
      setTimeout(() => this.showQuarterBanner.set(false), 3000);
    }
    this._prevTimeLeft = tl;
  });

}
