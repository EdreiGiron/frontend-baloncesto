import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { GameStore } from './game-store';
import { AuthService } from './auth.service';

const DEBUG = false;

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private hub?: signalR.HubConnection;
  private matchId = 'demo-001'; 

  constructor(private store: GameStore, private auth: AuthService) {}

  async connect(baseUrl = 'http://localhost:8080') {
    if (this.hub) return;

    const hubUrl = `${baseUrl}/hub/score`;

    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        // En websockets, el token va en la querystring. accessTokenFactory es la forma correcta.
        accessTokenFactory: () => this.auth.getToken() ?? '',
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build();

    // Logs útiles de reconexión (opcionales)
    this.hub.onreconnecting(err => DEBUG && console.warn('[hub] reconnecting...', err));
    this.hub.onreconnected(id => DEBUG && console.info('[hub] reconnected:', id));
    this.hub.onclose(err => DEBUG && console.warn('[hub] closed', err));

    // ---- Handlers del estado que ya tenías ----
    this.hub.on('state', (state: any) => {
      DEBUG && console.log('[recv]', state);

      this.store.home.set(state.home);
      this.store.away.set(state.away);
      this.store.quarter.set(state.quarter);

      if (typeof state.timeLeftMs === 'number') this.store.setTimeLeftMs(state.timeLeftMs);

      const curDur = this.store.quarterDurationMs();
      if (typeof state.quarterDurationMs === 'number' && state.quarterDurationMs !== curDur) {
        this.store.setQuarterMinutes(Math.floor(state.quarterDurationMs / 60000));
      }

      this.store.setPossession(state.possession ?? null);

      if (typeof state.timeoutLeftMs === 'number') this.store.timeoutLeftMs.set(state.timeoutLeftMs);
      if (state.timeoutBy === 'home' || state.timeoutBy === 'away') this.store.timeoutBy.set(state.timeoutBy);
      else this.store.timeoutBy.set(null);

      if (this.store.isTimeout()) this.store.pause();
      else if (state.running) this.store.start();
      else this.store.pause();
    });

    // Conecta + únete al partido
    await this.hub.start().catch(err => {
      DEBUG && console.error('[hub] start error', err);
      throw err;
    });

    await this.hub.invoke('JoinMatch', this.matchId);
    DEBUG && console.log('[hub] connected and joined', this.matchId);
  }

  async disconnect() {
    if (!this.hub) return;
    try { await this.hub.invoke('LeaveMatch', this.matchId); } catch { /* noop */ }
    await this.hub.stop();
    this.hub = undefined;
  }

  async pushState() {
    if (!this.hub) return;
    const payload = {
      matchId: this.matchId,
      home: this.store.home(),
      away: this.store.away(),
      quarter: this.store.quarter(),
      quarterDurationMs: this.store.quarterDurationMs(),
      timeLeftMs: this.store.getTimeLeftMs(),
      possession: this.store.possession(),
      running: this.store.running(),
      timeoutLeftMs: this.store.timeoutLeftMs(),
      timeoutBy: this.store.timeoutBy(),
    };
    DEBUG && console.log('[push]', payload);
    await this.hub.invoke('BroadcastState', this.matchId, payload);
  }
}
