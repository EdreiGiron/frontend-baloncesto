import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameStore, TeamKey } from '../../../core/game-store';
import { RealtimeService } from '../../../core/realtime.service';
import { ApiService } from '../../../core/api.service';

@Component({
  standalone: true,
  selector: 'app-control-panel',
  imports: [FormsModule],
  templateUrl: './control-panel.html',
  styleUrls: ['./control-panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlPanelComponent implements OnInit, OnDestroy {
  public s = inject(GameStore);

  constructor(private rt: RealtimeService, private api: ApiService) { }

  ngOnInit() { void this.rt.connect('http://localhost:5000'); }
  ngOnDestroy() { this.stopTimeoutSync(); void this.rt.disconnect(); }

  home = this.s.home; away = this.s.away;
  quarter = this.s.quarter; timeLabel = this.s.timeLabel;
  bonusHome = this.s.bonusHome; bonusAway = this.s.bonusAway;
  possession = this.s.possession; timeoutLabel = this.s.timeoutLabel;

  homeName = computed(() => this.home().name?.trim() || 'LOCAL');
  awayName = computed(() => this.away().name?.trim() || 'VISITA');

  minutes = 10;

  private _lastQuarter = this.s.quarter();

  private quarterSyncEffect = effect(() => {
    const q = this.s.quarter();
    if (q !== this._lastQuarter) {
      this._lastQuarter = q;
      void this.rt.pushState();
    }
  });

  // --- Acciones + push ---
  setNames(h: string, a: string) { this.s.setTeamName('home', h); this.s.setTeamName('away', a); void this.rt.pushState(); }
  add(t: TeamKey, p: 1 | 2 | 3) { this.s.addPoints(t, p); void this.rt.pushState(); }
  sub(t: TeamKey) { this.s.removePoint(t); void this.rt.pushState(); }
  foul(t: TeamKey) { this.s.addFoul(t); void this.rt.pushState(); }
  resetFouls() { this.s.resetFouls(); void this.rt.pushState(); }

  start() { this.s.start(); void this.rt.pushState(); }
  pause() { this.s.pause(); void this.rt.pushState(); }
  resetClock() { this.s.resetClock(); void this.rt.pushState(); }
  setMinutes() { this.s.setQuarterMinutes(this.minutes); void this.rt.pushState(); }

  setQuarter(q: 1 | 2 | 3 | 4) { this.s.setQuarter(q); void this.rt.pushState(); }
  nextQuarter() { this.s.nextQuarter(); void this.rt.pushState(); }

  setPos(v: TeamKey | null) { this.s.setPossession(v); void this.rt.pushState(); }

  callTO(t: TeamKey, secs: 30 | 60) {
    this.s.callTimeout(t, secs);
    void this.rt.pushState();
    this.startTimeoutSync();
  }

  resetAll() { this.s.resetAll(); void this.rt.pushState(); }

  // --- Sync de Timeout cada 1s ---
  private timeoutSyncId: any = null;

  private startTimeoutSync() {
    this.stopTimeoutSync();
    this.timeoutSyncId = setInterval(() => {
      void this.rt.pushState();
      if (this.s.timeoutLeftMs() <= 0) this.stopTimeoutSync();
    }, 1000);
  }
  private stopTimeoutSync() {
    if (this.timeoutSyncId) { clearInterval(this.timeoutSyncId); this.timeoutSyncId = null; }
  }

  // --- Guardar partido---
  saveGame() {
    const dto = {
      matchId: 'demo-001',
      home: this.s.home(),
      away: this.s.away(),
      quarter: this.s.quarter(),
      quarterDurationMs: this.s.quarterDurationMs(),
      timeLeftMs: this.s.getTimeLeftMs(),
      possession: this.s.possession()
    };
    this.api.save(dto).subscribe(() => alert('Partido guardado'));

  }

  showQuarterToast = signal(false);
  endedQuarterCtl = signal<1 | 2 | 3 | 4>(1);

  //CAMBIO DE Q1 A Q3 MANUAL O AUTO PARA MOSTRAR
  private _prevQuarterCtl = this.s.quarter();
  private quarterToastEffect = effect(() => {
    const q = this.s.quarter();
    const between = (q > this._prevQuarterCtl) && !this.s.running() && (this.s.getTimeLeftMs() === this.s.quarterDurationMs());
    if (between) {
      this.endedQuarterCtl.set(this._prevQuarterCtl as 1 | 2 | 3 | 4);
      this.showQuarterToast.set(true);
      setTimeout(() => this.showQuarterToast.set(false), 2200);
    }
    this._prevQuarterCtl = q;
  });
  // FIN DEL PARTIDO
  private _prevTlCtl = this.s.getTimeLeftMs();
  private finalToastEffect = effect(() => {
    const tl = this.s.getTimeLeftMs();
    const isEnd = this.s.quarter() === 4 && !this.s.running() && this._prevTlCtl > 0 && tl === 0;
    if (isEnd) {
      this.endedQuarterCtl.set(4);
      this.showQuarterToast.set(true);
      setTimeout(() => this.showQuarterToast.set(false), 2600);
    }
    this._prevTlCtl = tl;
  });

}
