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

  if (threshold != null) {
    // Threshold-based winner determination
    const meetingThreshold = aggregates.filter(
      (a) => a.votes / totalVotesCast >= threshold,
    );

    if (meetingThreshold.length === 0) {
      // No outcome meets threshold
      return {
        outcomes: aggregates
          .sort((a, b) => b.votes - a.votes)
          .map((a) => ({
            ...a,
            share: a.votes / totalVotesCast,
            isWinner: false,
            isTied: false,
          })),
        totalVotesCast,
        winnerStatus: 'threshold-not-met',
      };
    }

    if (meetingThreshold.length > 1) {
      // Multiple outcomes meet threshold — check for tie (equal votes)
      const topVotes = Math.max(...meetingThreshold.map((a) => a.votes));
      const tiedAtTop = meetingThreshold.filter((a) => a.votes === topVotes);
      const isTie = tiedAtTop.length > 1;

      return {
        outcomes: aggregates
          .sort((a, b) => b.votes - a.votes)
          .map((a) => ({
            ...a,
            share: a.votes / totalVotesCast,
            isWinner: !isTie && a.votes / totalVotesCast >= threshold,
            isTied: isTie && a.votes === topVotes,
          })),
        totalVotesCast,
        winnerStatus: isTie ? 'tie' : 'winner',
      };
    }

    // Exactly one outcome meets threshold
    const winner = meetingThreshold[0]!;
    return {
      outcomes: aggregates
        .sort((a, b) => b.votes - a.votes)
        .map((a) => ({
          ...a,
          share: a.votes / totalVotesCast,
          isWinner: a.field === winner.field,
          isTied: false,
        })),
      totalVotesCast,
      winnerStatus: 'winner',
    };
  }

  // Plurality: most votes wins
  const maxVotes = Math.max(...aggregates.map((a) => a.votes));
  const topOutcomes = aggregates.filter((a) => a.votes === maxVotes);
  const isTie = topOutcomes.length > 1;

  return {
    outcomes: aggregates
      .sort((a, b) => b.votes - a.votes)
      .map((a) => ({
        ...a,
        share: a.votes / totalVotesCast,
        isWinner: !isTie && a.votes === maxVotes,
        isTied: isTie && a.votes === maxVotes,
      })),
    totalVotesCast,
    winnerStatus: isTie ? 'tie' : 'winner',
  };
}
