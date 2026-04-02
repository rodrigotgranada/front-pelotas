export interface Team {
  id: string;
  _id?: string;
  name: string;
  shortName?: string;
  logoUrl?: string | null;
  isPelotas: boolean;
}

export interface Competition {
  id: string;
  _id?: string;
  name: string;
  season: string;
  externalTableUrl?: string | null;
  logoUrl?: string | null;
  isActive: boolean;
}

export interface MatchGoal {
  minute: number;
  scorer: string;
  team: 'PELOTAS' | 'OPPONENT';
}

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED';

export interface Match {
  id: string;
  _id?: string;
  competitionId?: string | Competition;
  opponentId: string | Team;
  date: string;
  stadium: string;
  isHome: boolean;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  goals: MatchGoal[];
  ticketsUrl?: string | null;
  newsId?: string | null;
  transmissionUrl?: string | null;
  opponent?: Team; // Populated opponent
  competition?: Competition; // Populated competition
}

export interface CreateMatchPayload {
  competitionId?: string;
  opponentId: string;
  date: string;
  stadium: string;
  isHome?: boolean;
  homeScore?: number;
  awayScore?: number;
  status?: MatchStatus;
  goals?: MatchGoal[];
  ticketsUrl?: string;
  transmissionUrl?: string;
}
