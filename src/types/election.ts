import type Polygon from '@arcgis/core/geometry/Polygon';

export interface OutcomeFieldMapping {
  label: string;
  field: string;
}

/** From the Boundaries feature layer */
export interface Boundary {
  globalId: string;
  internalId: string | null;
  internalIdAlias: string | null;
  registeredVoters: number | null;
  totalPopulation: number | null;
  geometry: Polygon | null;
}

/** From the Issues Registry table */
export interface IssueRegistryRow {
  globalId: string;
  internalId: string | null;
  issueName: string;
  issueDescription: string | null;
  issueUrl: string;
  issueType: 'candidate' | 'ballot measure' | 'other';
  winThreshold: number | null;
  outcomeLabels: string[];
  hasTotalVotes: boolean;
  hasBallotWoVote: boolean;
}

/** From a per-issue table — one row per boundary */
export interface VoteRow {
  boundaryId: string;
  issueId: string;
  outcomes: Record<string, number>;
  totalVotes: number | null;
  ballotWoVote: number | null;
}

/** Computed outcome for display */
export interface OutcomeResult {
  label: string;
  field: string;
  votes: number;
  share: number;
  isWinner: boolean;
  isTied: boolean;
}

export type WinnerStatus = 'winner' | 'tie' | 'no-winner' | 'threshold-not-met';

/** Fully computed issue for rendering */
export interface ComputedIssue {
  registry: IssueRegistryRow;
  outcomeFields: OutcomeFieldMapping[];
  voteRows: VoteRow[];
  outcomes: OutcomeResult[];
  totalVotesCast: number;
  turnoutPercent: number | null;
  ballotWithoutVote: number | null;
  winnerStatus: WinnerStatus;
}
