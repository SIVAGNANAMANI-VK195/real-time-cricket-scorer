
// Match types
export type MatchStatus = 'setup' | 'toss' | 'in_progress' | 'innings_break' | 'completed';
export type InningsNumber = 1 | 2;
export type BallType = 'normal' | 'wide' | 'no_ball' | 'bye' | 'leg_bye';
export type WicketType = 'bowled' | 'caught' | 'lbw' | 'stumped' | 'run_out' | 'hit_wicket' | 'retired' | 'obstructing' | 'handled_ball' | 'timed_out' | 'other';
export type TossDecision = 'bat' | 'bowl';

// Player and team types
export interface Player {
  id: string;
  name: string;
  isCaptain: boolean;
  isWicketkeeper: boolean;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
}

// Ball by ball data
export interface BallData {
  id: string;
  over: number;
  ball: number;
  batsmanId: string;
  bowlerId: string;
  runs: number;
  extras: number;
  extraType?: BallType;
  isWicket: boolean;
  wicketType?: WicketType;
  wicketPlayerId?: string;
  timestamp: number;
}

// Over data for visualization
export interface OverSummary {
  overNumber: number;
  runs: number;
  wickets: number;
}

// Batting stats
export interface BattingStats {
  playerId: string;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  dotBalls: number;
  isOut: boolean;
  wicketType?: WicketType;
  bowlerId?: string;
}

// Bowling stats
export interface BowlingStats {
  playerId: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  dots: number;
}

// Match data
export interface Match {
  id: string;
  code: string;
  status: MatchStatus;
  teams: {
    team1: Team;
    team2: Team;
  };
  toss: {
    winner: 'team1' | 'team2';
    decision: TossDecision;
  } | null;
  totalOvers: number;
  currentInnings: InningsNumber;
  battingTeam: 'team1' | 'team2';
  innings: {
    first: {
      balls: BallData[];
      currentOver: number;
      currentBall: number;
      totalRuns: number;
      wickets: number;
      battingStats: Record<string, BattingStats>;
      bowlingStats: Record<string, BowlingStats>;
      striker: string | null;
      nonStriker: string | null;
      currentBowler: string | null;
    };
    second: {
      balls: BallData[];
      currentOver: number;
      currentBall: number;
      totalRuns: number;
      wickets: number;
      battingStats: Record<string, BattingStats>;
      bowlingStats: Record<string, BowlingStats>;
      striker: string | null;
      nonStriker: string | null;
      currentBowler: string | null;
    };
  };
  created: number;
  updated: number;
}

// View mode (for UI display)
export type ViewMode = 'umpire' | 'spectator';
