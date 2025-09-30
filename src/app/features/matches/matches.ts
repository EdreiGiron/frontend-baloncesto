export interface TeamState {
  name: string;
  score: number;
  fouls: number;
  timeouts30: number;
  timeouts60: number;
}

export interface GameSnapshot {
  matchId: string;
  home: TeamState;
  away: TeamState;
  quarter: number;
  quarterDurationMs: number;
  timeLeftMs: number;
  possession?: string;
  savedAtUtc: string;
}
