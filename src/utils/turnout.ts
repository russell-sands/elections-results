import type { IssueRegistryRow, VoteRow } from '../types/election';

export function computeTurnout(
  totalVotesCast: number,
  totalRegisteredVoters: number | null,
): number | null {
  if (totalRegisteredVoters == null || totalRegisteredVoters === 0) {
    return null;
  }
  return totalVotesCast / totalRegisteredVoters;
}

export function computeBallotWithoutVote(
  registry: IssueRegistryRow,
  voteRows: VoteRow[],
): number | null {
  if (!registry.hasBallotWoVote) return null;
  return voteRows.reduce((sum, row) => sum + (row.ballotWoVote ?? 0), 0);
}
