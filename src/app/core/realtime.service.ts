import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { GameStore } from './game-store';

const DEBUG = false; 

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private hub?: signalR.HubConnection;
  private matchId = 'demo-001'; 

  constructor(private store: GameStore) {}

  async connect(baseUrl = 'http://localhost:5000') {
    if (this.hub) return;
    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hub/score`, { withCredentials: true })
      .withAutomaticReconnect()
      .build();


    // Handler de estado
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

    await this.hub.start();
    await this.hub.invoke('JoinMatch', this.matchId);
    DEBUG && console.log('[hub] connected and joined', this.matchId);
  }

  async disconnect() {
    if (!this.hub) return;
    await this.hub.invoke('LeaveMatch', this.matchId);
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
