import type { IssueRegistryRow, VoteRow } from '../types/election';

export function computeTotalVotesForIssue(
  registry: IssueRegistryRow,
  voteRows: VoteRow[],
): number {
  return voteRows.reduce((sum, row) => {
    if (registry.hasTotalVotes && row.totalVotes != null) {
      return sum + row.totalVotes;
    }
    // Sum all outcome fields
    const rowTotal = registry.outcomeLabels.reduce(
      (s, _, i) => s + (row.outcomes[`outcome_${i + 1}`] ?? 0),
      0,
    );
    return sum + rowTotal;
  }, 0);
}

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
