import { Injectable, signal, computed, effect } from '@angular/core';

export type TeamKey = 'home' | 'away';
interface TeamState { name: string; score: number; fouls: number; timeouts30: number; timeouts60: number; }

@Injectable({ providedIn: 'root' })
export class GameStore {
  readonly home = signal<TeamState>({ name: 'LOCAL', score: 0, fouls: 0, timeouts30: 2, timeouts60: 2 });
  readonly away = signal<TeamState>({ name: 'VISITA', score: 0, fouls: 0, timeouts30: 2, timeouts60: 2 });

  readonly quarter = signal<1|2|3|4>(1);
  readonly quarterDurationMs = signal(10 * 60 * 1000);
  readonly timeLeftMs = signal(this.quarterDurationMs());
  readonly running = signal(false);

  // posesión: 'home'|'away'|null
  readonly possession = signal<TeamKey | null>(null);

  // timeout en curso (0 = ninguno)
  readonly timeoutLeftMs = signal(0);

  // BONUS: enciende si faltas >= 5
  readonly bonusHome = computed(() => this.home().fouls >= 5);
  readonly bonusAway = computed(() => this.away().fouls >= 5);

  readonly timeLabel = computed(() => this.formatClock(this.timeLeftMs()));
  readonly timeoutLabel = computed(() => this.timeoutLeftMs() > 0 ? this.formatClock(this.timeoutLeftMs()) : '');

  private gameInterval: any | null = null;
  private timeoutInterval: any | null = null;

  constructor() {
    effect(() => { if (!this.running()) this.timeLeftMs.set(this.quarterDurationMs()); });
  }

  // helpers
  private formatClock(ms: number) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  setTeamName(t: TeamKey, name: string) {
    const S = t === 'home' ? this.home : this.away;
    S.update(v => ({ ...v, name }));
  }

  addPoints(t: TeamKey, pts: 1|2|3) {
    const S = t === 'home' ? this.home : this.away;
    S.update(v => ({ ...v, score: Math.max(0, v.score + pts) }));
  }
  removePoint(t: TeamKey) {
    const S = t === 'home' ? this.home : this.away;
    S.update(v => ({ ...v, score: Math.max(0, v.score - 1) }));
  }

  addFoul(t: TeamKey) {
    const S = t === 'home' ? this.home : this.away;
    S.update(v => ({ ...v, fouls: v.fouls + 1 }));
  }
  resetFouls() {
    this.home.update(v => ({ ...v, fouls: 0 }));
    this.away.update(v => ({ ...v, fouls: 0 }));
  }

  setQuarter(q: 1|2|3|4) { this.quarter.set(q); this.stop(); this.timeLeftMs.set(this.quarterDurationMs()); }
  nextQuarter() { if (this.quarter() < 4) this.setQuarter((this.quarter() + 1) as 1|2|3|4); }

  setQuarterMinutes(m: number) {
    const ms = Math.max(1, m) * 60 * 1000;
    this.quarterDurationMs.set(ms);
    if (!this.running()) this.timeLeftMs.set(ms);
  }

  start() {
    if (this.running() || this.timeoutLeftMs() > 0) return;
    this.running.set(true);
    this.gameInterval = setInterval(() => {
      const next = this.timeLeftMs() - 1000;
      if (next <= 0) {
        this.timeLeftMs.set(0);
        this.stop();
        // auto-avance de cuarto opcional:
        // if (this.quarter() < 4) this.nextQuarter();
      } else {
        this.timeLeftMs.set(next);
      }
    }, 1000);
  }

  pause() { this.stop(false); }
  resetClock() { this.stop(); this.timeLeftMs.set(this.quarterDurationMs()); }

  // timeouts (30s / 60s)
  callTimeout(t: TeamKey, seconds: 30 | 60) {
    const key = seconds === 30 ? 'timeouts30' : 'timeouts60';
    const S = t === 'home' ? this.home : this.away;
    const has = S()[key];
    if (has <= 0 || this.timeoutLeftMs() > 0) return;

    // descuenta y arranca temporizador de timeout
    S.update(v => ({ ...v, [key]: v[key] - 1 }));
    this.stop();
    this.timeoutLeftMs.set(seconds * 1000);
    this.timeoutInterval = setInterval(() => {
      const next = this.timeoutLeftMs() - 1000;
      if (next <= 0) { this.timeoutLeftMs.set(0); this.clearTimeoutTimer(); }
      else this.timeoutLeftMs.set(next);
    }, 1000);
  }
  private clearTimeoutTimer() { if (this.timeoutInterval) clearInterval(this.timeoutInterval); this.timeoutInterval = null; }

  setPossession(v: TeamKey | null) { this.possession.set(v); }

  resetAll() {
    this.stop();
    this.clearTimeoutTimer();
    this.home.set({ name: 'LOCAL', score: 0, fouls: 0, timeouts30: 2, timeouts60: 2 });
    this.away.set({ name: 'VISITA', score: 0, fouls: 0, timeouts30: 2, timeouts60: 2 });
    this.quarter.set(1);
    this.possession.set(null);
    this.timeLeftMs.set(this.quarterDurationMs());
    this.timeoutLeftMs.set(0);
  }

  private stop(resetRunning = true) {
    if (this.gameInterval) clearInterval(this.gameInterval);
    this.gameInterval = null;
    if (resetRunning) this.running.set(false);
  }
}
