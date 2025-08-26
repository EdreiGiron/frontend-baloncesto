import { Injectable, signal, computed } from '@angular/core';

export type TeamKey = 'home' | 'away';
interface TeamState {
  name: string; score: number; fouls: number;
  timeouts30: number; timeouts60: number;
}

@Injectable({ providedIn: 'root' })
export class GameStore {
  // === EQUIPOS ===
  readonly home = signal<TeamState>({ name: 'LOCAL', score: 0, fouls: 0, timeouts30: 2, timeouts60: 2 });
  readonly away = signal<TeamState>({ name: 'VISITA', score: 0, fouls: 0, timeouts30: 2, timeouts60: 2 });

  // === PARTIDO ===
  readonly quarter = signal<1|2|3|4>(1);
  readonly quarterDurationMs = signal(10 * 60 * 1000);
  readonly timeLeftMs = signal(this.quarterDurationMs());
  readonly running = signal(false);

  // Posesión
  readonly possession = signal<TeamKey | null>(null);

  // Timeout
  readonly timeoutLeftMs = signal(0);
  readonly timeoutBy = signal<TeamKey | null>(null);
  readonly isTimeout = computed(() => this.timeoutLeftMs() > 0);

  // Computeds de UI
  readonly timeLabel = computed(() => this.formatClock(this.timeLeftMs()));
  readonly timeoutLabel = computed(() =>
    this.timeoutLeftMs() > 0 ? this.formatClock(this.timeoutLeftMs()) : ''
  );
  readonly bonusHome = computed(() => this.home().fouls >= 5);
  readonly bonusAway = computed(() => this.away().fouls >= 5);

  private gameInterval: any | null = null;
  private timeoutInterval: any | null = null;

  // ===== Helpers =====
  private formatClock(ms: number) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  // ===== Mutadores de equipo =====
  setTeamName(t: TeamKey, name: string) {
    const S = t === 'home' ? this.home : this.away;
    S.update(v => ({ ...v, name: name ?? '' }));
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

  // ===== Cuartos / Reloj =====
  setQuarter(q: 1|2|3|4) { this.quarter.set(q); this.resetClock(); }
  nextQuarter() { if (this.quarter() < 4) this.setQuarter((this.quarter()+1) as 1|2|3|4); }

  setQuarterMinutes(minutes: number) {
    const ms = Math.max(1, minutes) * 60 * 1000;
    this.quarterDurationMs.set(ms);

    if (!this.running() && this.timeLeftMs() > ms) this.timeLeftMs.set(ms);
  }

  start() {
    if (this.running() || this.isTimeout()) return;
    this.running.set(true);
    this.clearGameTimer();
    this.gameInterval = setInterval(() => {
      const next = this.timeLeftMs() - 1000;
      if (next <= 0) {
        this.timeLeftMs.set(0);
        this.pause();
      } else {
        this.timeLeftMs.set(next);
      }
    }, 1000);
  }

  pause() { this.stop(); }  
  resetClock() { this.stop(); this.timeLeftMs.set(this.quarterDurationMs()); }

  private stop() {
    this.clearGameTimer();
    this.running.set(false);
  }
  private clearGameTimer() {
    if (this.gameInterval) clearInterval(this.gameInterval);
    this.gameInterval = null;
  }

  // ===== Timeout =====
  callTimeout(t: TeamKey, seconds: 30 | 60) {
    const key = seconds === 30 ? 'timeouts30' : 'timeouts60';
    const S = t === 'home' ? this.home : this.away;
    if (S()[key] <= 0 || this.isTimeout()) return;

    S.update(v => ({ ...v, [key]: v[key] - 1 }));
    this.stop();
    this.timeoutBy.set(t);
    this.timeoutLeftMs.set(seconds * 1000);

    this.clearTimeoutTimer();
    this.timeoutInterval = setInterval(() => {
      const next = this.timeoutLeftMs() - 1000;
      if (next <= 0) {
        this.timeoutLeftMs.set(0);
        this.timeoutBy.set(null);
        this.clearTimeoutTimer();

        // this.start();
      } else {
        this.timeoutLeftMs.set(next);
      }
    }, 1000);
  }
  private clearTimeoutTimer() {
    if (this.timeoutInterval) clearInterval(this.timeoutInterval);
    this.timeoutInterval = null;
  }

  // ===== API para realtime =====
  getTimeLeftMs() { return this.timeLeftMs(); }
  setTimeLeftMs(ms: number) { this.timeLeftMs.set(ms); }
  setPossession(v: TeamKey | null) { this.possession.set(v); }

  resetAll() {
    this.stop(); this.clearTimeoutTimer();
    this.home.set({ name: 'LOCAL', score: 0, fouls: 0, timeouts30: 2, timeouts60: 2 });
    this.away.set({ name: 'VISITA', score: 0, fouls: 0, timeouts30: 2, timeouts60: 2 });
    this.quarter.set(1);
    this.possession.set(null);
    this.timeLeftMs.set(this.quarterDurationMs());
    this.timeoutLeftMs.set(0);
    this.timeoutBy.set(null);
  }
}
