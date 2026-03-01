import type { Boundary, IssueRegistryRow, VoteRow } from '../types/election';

export interface ElectionState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
  boundaries: Boundary[];
  boundariesHaveInternalId: boolean;
  boundaryInternalIdAlias: string | null;
  issueRegistry: IssueRegistryRow[];
  voteData: Map<string, VoteRow[]>;
  totalRegisteredVoters: number | null;
}

export type ElectionAction =
  | { type: 'LOAD_START' }
  | {
      type: 'LOAD_SUCCESS';
      payload: {
        boundaries: Boundary[];
        boundariesHaveInternalId: boolean;
        boundaryInternalIdAlias: string | null;
        issueRegistry: IssueRegistryRow[];
        voteData: Map<string, VoteRow[]>;
        totalRegisteredVoters: number | null;
      };
    }
  | { type: 'LOAD_ERROR'; payload: string };

export const initialElectionState: ElectionState = {
  status: 'idle',
  error: null,
  boundaries: [],
  boundariesHaveInternalId: false,
  boundaryInternalIdAlias: null,
  issueRegistry: [],
  voteData: new Map(),
  totalRegisteredVoters: null,
};

export function electionReducer(state: ElectionState, action: ElectionAction): ElectionState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', error: null };
    case 'LOAD_SUCCESS':
      return { ...state, status: 'ready', ...action.payload };
    case 'LOAD_ERROR':
      return { ...state, status: 'error', error: action.payload };
    default:
      return state;
  }
}
