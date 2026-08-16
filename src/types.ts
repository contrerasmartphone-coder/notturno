export type TeamLevel = 'Base' | 'Intermedio' | 'Avanzato';

export interface Team {
  id: string;
  name: string;
  level: TeamLevel;
  registeredAt: string;
  createdAt?: number; // Epoch timestamp for precise insertion ordering
  group?: string; // "Girone A", "Girone B", "Girone C", "Girone D", "Girone E"
  
  // Dynamic stats computed for standings
  wins: number;
  losses: number;
  setsWon: number;
  setsLost: number;
  pointsWon: number;
  pointsLost: number;
  points: number; // 3 points per win
  rankInGroup?: number; // 1, 2, or 3
  overallRank?: number; // 1 to 15 in Classifica Avulsa
}

export interface SetScore {
  team1: number;
  team2: number;
}

export interface Match {
  id: string;
  round: number; // 1 = Gironi, 2 = Ottavi, 3 = Quarti, 4 = Semifinali, 5 = Finali
  roundLabel: string;
  position: number;
  team1: Team | null;
  team2: Team | null;
  team1Score: number; // Sets won
  team2Score: number; // Sets won
  sets: SetScore[]; // Points per set
  status: 'scheduled' | 'live' | 'completed';
  court: string; // e.g. "Campo 1", "Campo 2", "Campo 3"
  time: string; // e.g. "20:30"
  winnerId?: string;
  nextMatchId?: string;
  nextMatchSlot?: 'team1' | 'team2';
  loserMatchId?: string;
  loserMatchSlot?: 'team1' | 'team2';
  phase: 'gironi' | 'eliminazione';
  groupName?: string;
  pointsPerSet: number; // 25 (or 15 for TB in QF if mode 2/3)
  maxSets: number; // 1 (single set) or 3 (best of 3)
  tieBreakPoints?: number; // 15 or 25
  matchSeedLabel?: string; // e.g. "8° vs 9°", "2° vs 15°", "BYE (1° Classificato)"
  notes?: string;
}

export interface NotificationLog {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'live_update' | 'schedule_change' | 'system' | 'result';
  matchId?: string;
}

export type QuarterFinalsMode = 'single_set_25' | 'best_of_3_tb15';

export interface TournamentConfig {
  tournamentName?: string;
  tournamentDate?: string;
  tournamentLocation?: string;
  quarterFinalsMode: QuarterFinalsMode;
  courtCount: number;
  courtName?: string;
  startTime: string;
  durationSingleSetMinutes: number;
  durationBestOf3Minutes: number;
  matchDurationMinutes?: number;
}

export interface TournamentBackup {
  id: string;
  name: string;
  createdAt: number;
  createdAtFormatted: string;
  teams: Team[];
  matches: Match[];
  config: TournamentConfig;
  notifications?: NotificationLog[];
  createdBy?: string;
  teamsCount: number;
  matchesCount: number;
}

