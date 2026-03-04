import type { OutcomeResult, WinnerStatus, IssueRegistryRow, VoteRow } from '../types/election';

interface OutcomeAggregate {
  label: string;
  field: string;
  votes: number;
}

function aggregateOutcomes(
  registry: IssueRegistryRow,
  voteRows: VoteRow[],
): OutcomeAggregate[] {
  return registry.outcomeLabels.map((label, i) => {
    const field = `outcome_${i + 1}`;
    const votes = voteRows.reduce((sum, row) => sum + (row.outcomes[field] ?? 0), 0);
    return { label, field, votes };
  });
}

export function computeOutcomeResults(
  registry: IssueRegistryRow,
  voteRows: VoteRow[],
): { outcomes: OutcomeResult[]; totalVotesCast: number; winnerStatus: WinnerStatus } {
  const aggregates = aggregateOutcomes(registry, voteRows);
  const totalVotesCast = aggregates.reduce((sum, a) => sum + a.votes, 0);

  if (totalVotesCast === 0) {
    return {
      outcomes: aggregates.map((a) => ({
        ...a,
        share: 0,
        isWinner: false,
        isTied: false,
      })),
      totalVotesCast: 0,
      winnerStatus: 'no-winner',
    };
  }

  const threshold = registry.winThreshold;
  const allowedWinners = registry.allowedWinners ?? 1;

  // Sort descending by votes
  const sorted = [...aggregates].sort((a, b) => b.votes - a.votes);

  // Determine top-N candidates, handling ties at the cut boundary
  const cutoffVotes = sorted[allowedWinners - 1]?.votes ?? 0;
  const aboveCut = sorted.filter((a) => a.votes > cutoffVotes);
  const atCut = sorted.filter((a) => a.votes === cutoffVotes);
  const slotsRemaining = allowedWinners - aboveCut.length;
  const isTieAtBoundary = atCut.length > slotsRemaining;

  // Build candidate set: those clearly in top N
  const topNFields = new Set(aboveCut.map((a) => a.field));
  if (!isTieAtBoundary) {
    atCut.forEach((a) => topNFields.add(a.field));
  }
  const tiedFields = new Set(isTieAtBoundary ? atCut.map((a) => a.field) : []);

  // Apply threshold filter if set
  let winnerFields: Set<string>;
  let winnerStatus: WinnerStatus;

  if (threshold != null) {
    // From top-N, only keep those meeting threshold
    const meetsThreshold = (a: OutcomeAggregate) =>
      a.votes / totalVotesCast >= threshold;

    if (isTieAtBoundary) {
      // Tied outcomes at cut — check if any of the non-tied top outcomes meet threshold
      const confirmedWinners = aboveCut.filter(meetsThreshold);
      if (confirmedWinners.length > 0) {
        winnerFields = new Set(confirmedWinners.map((a) => a.field));
        winnerStatus = 'winner';
      } else {
        winnerFields = new Set();
        winnerStatus = 'threshold-not-met';
      }
      // Still mark the tie at the boundary
    } else {
      const topNOutcomes = sorted.filter((a) => topNFields.has(a.field));
      const winners = topNOutcomes.filter(meetsThreshold);
      winnerFields = new Set(winners.map((a) => a.field));
      winnerStatus = winners.length > 0 ? 'winner' : 'threshold-not-met';
    }
  } else {
    // No threshold — top N win unconditionally
    if (isTieAtBoundary) {
      winnerFields = new Set(aboveCut.map((a) => a.field));
      winnerStatus = aboveCut.length > 0 ? 'winner' : 'tie';
      // If no one is clearly above the tie, it's purely a tie
      if (aboveCut.length === 0) winnerStatus = 'tie';
    } else {
      winnerFields = topNFields;
      winnerStatus = 'winner';
    }
  }

  return {
    outcomes: sorted.map((a) => ({
      ...a,
      share: a.votes / totalVotesCast,
      isWinner: winnerFields.has(a.field),
      isTied: tiedFields.has(a.field),
    })),
    totalVotesCast,
    winnerStatus,
  };
}
