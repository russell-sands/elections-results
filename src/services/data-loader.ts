import type { Boundary, IssueRegistryRow, VoteRow } from '../types/election';
import { fetchBoundaries, type BoundariesResult } from './boundaries.service';
import { fetchIssuesRegistry } from './issues-registry.service';
import { fetchIssueVoteRows } from './issue-data.service';

export interface ElectionLoadResult {
  boundaries: Boundary[];
  boundariesHaveInternalId: boolean;
  boundaryInternalIdAlias: string | null;
  issueRegistry: IssueRegistryRow[];
  voteData: Map<string, VoteRow[]>;
  totalRegisteredVoters: number | null;
}

export async function loadElectionData(
  boundariesUrl: string,
  issuesRegistryUrl: string,
): Promise<ElectionLoadResult> {
  // Fetch boundaries and issues registry in parallel
  const [boundariesResult, issueRegistry] = await Promise.all([
    fetchBoundaries(boundariesUrl),
    fetchIssuesRegistry(issuesRegistryUrl),
  ]);

  const { boundaries, hasInternalId, internalIdAlias }: BoundariesResult = boundariesResult;

  // Fetch all per-issue vote tables in parallel, driven by registry
  const issueVoteResults = await Promise.all(
    issueRegistry.map((r) => fetchIssueVoteRows(r.issueUrl, r)),
  );

  // Build voteData map keyed by issue name
  const voteData = new Map<string, VoteRow[]>();
  issueRegistry.forEach((r, i) => {
    const rows = issueVoteResults[i];
    if (rows) {
      voteData.set(r.issueName, rows);
    }
  });

  // Aggregate registered voters
  const totalRegisteredVoters = boundaries.reduce((sum, b) => {
    if (b.registeredVoters != null) return sum + b.registeredVoters;
    return sum;
  }, 0);

  return {
    boundaries,
    boundariesHaveInternalId: hasInternalId,
    boundaryInternalIdAlias: internalIdAlias,
    issueRegistry,
    voteData,
    totalRegisteredVoters: totalRegisteredVoters > 0 ? totalRegisteredVoters : null,
  };
}
