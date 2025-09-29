import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameStore, TeamKey } from '../../../core/game-store';
import { RealtimeService } from '../../../core/realtime.service';
import { ApiService } from '../../../core/api.service';
import { TeamsService, Team } from '../../../core/teams.service';
import { PlayersService, Player } from '../../players/players';

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

  constructor(
    private rt: RealtimeService,
    private api: ApiService,
    private teamsSvc: TeamsService,
    private playersSvc: PlayersService,
  ) { }

  ngOnInit() {
    void this.rt.connect('http://localhost:8080');
    this.cargarEquipos();
    this.cargarJugadores();
  }
  ngOnDestroy() { this.stopTimeoutSync(); void this.rt.disconnect(); }

  // Store
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
    if (q !== this._lastQuarter) { this._lastQuarter = q; void this.rt.pushState(); }
  });

  // --- Datos desde BD ---
  teams = signal<Team[]>([]);
  players = signal<Player[]>([]);

  homeTeamId = signal<number | null>(null);
  awayTeamId = signal<number | null>(null);

  homeLogo = computed(() => this.teams().find(t => t.id === this.homeTeamId())?.logoUrl || '');
  awayLogo = computed(() => this.teams().find(t => t.id === this.awayTeamId())?.logoUrl || '');

  homePlayers = computed(() => {
    const id = this.homeTeamId(); return id == null ? [] : this.players().filter(p => p.teamId === id);
  });
  awayPlayers = computed(() => {
    const id = this.awayTeamId(); return id == null ? [] : this.players().filter(p => p.teamId === id);
  });

  homeRoster = signal<number[]>([]);
  awayRoster = signal<number[]>([]);

  private cargarEquipos() {
    this.teamsSvc.getAll().subscribe({
      next: data => this.teams.set(data ?? []),
      error: () => this.teams.set([]),
    });
  }
  private cargarJugadores() {
    this.playersSvc.getPlayers().subscribe({
      next: (data) => {
        const arr = data ?? [];

        const seen = new Set<number | string>();
        const unique = arr.filter(p => {
          const key = (p.id ?? `${p.fullName}|${p.number}|${p.teamId}`);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        unique.sort((a, b) =>
          (a.teamId - b.teamId) || (a.number - b.number) || a.fullName.localeCompare(b.fullName)
        );

        this.players.set(unique);
      },
      error: () => this.players.set([]),
    });
  }


  onSelectTeam(side: TeamKey, teamId: number | null) {
    if (side === 'home') this.homeTeamId.set(teamId); else this.awayTeamId.set(teamId);

    const team = this.teams().find(t => t.id === teamId!);
    if (team) {
      if (side === 'home') this.s.setTeamName('home', team.name);
      else this.s.setTeamName('away', team.name);
      void this.rt.pushState();
    }

    if (side === 'home') this.homeRoster.set([]); else this.awayRoster.set([]);
  }

  // FIX: no usar variable llamada "set". Usa rosterSig y su setter .set(...)
  toggleRoster(side: TeamKey, playerId: number, checked: boolean) {
    const rosterSig = side === 'home' ? this.homeRoster : this.awayRoster;
    const current = rosterSig();
    const next = checked
      ? Array.from(new Set([...current, playerId]))
      : current.filter(id => id !== playerId);
    rosterSig.set(next);
  }

  selectAll(side: TeamKey) {
    const allIds = (side === 'home' ? this.homePlayers() : this.awayPlayers())
      .map(p => p.id!)
      .filter((x): x is number => typeof x === 'number');
    (side === 'home' ? this.homeRoster : this.awayRoster).set(allIds);
  }

  clearRoster(side: TeamKey) {
    (side === 'home' ? this.homeRoster : this.awayRoster).set([]);
  }

  // Acciones + push
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

  resetAll() {
    this.s.resetAll();
    this.homeTeamId.set(null); this.awayTeamId.set(null);
    this.homeRoster.set([]); this.awayRoster.set([]);
    void this.rt.pushState();
  }

  // Sync timeout
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

  // Guardar partido
  saveGame() {
    const dto = {
      matchId: 'demo-001',
      home: { ...this.s.home(), teamId: this.homeTeamId(), roster: this.homeRoster() },
      away: { ...this.s.away(), teamId: this.awayTeamId(), roster: this.awayRoster() },
      quarter: this.s.quarter(),
      quarterDurationMs: this.s.quarterDurationMs(),
      timeLeftMs: this.s.getTimeLeftMs(),
      possession: this.s.possession()
    };
    this.api.save(dto).subscribe(() => alert('Partido guardado'));
  }

  showQuarterToast = signal(false);
  endedQuarterCtl = signal<1 | 2 | 3 | 4>(1);

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
