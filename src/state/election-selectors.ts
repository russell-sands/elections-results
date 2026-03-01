import type { ComputedIssue, IssueRegistryRow, OutcomeFieldMapping, VoteRow } from '../types/election';
import type { ElectionState } from './election-reducer';
import { computeOutcomeResults } from '../utils/winner';
import { computeTurnout, computeBallotWithoutVote } from '../utils/turnout';
import { SECTION_LABELS, ISSUE_TYPE_ORDER } from '../config/constants';

export function selectComputedIssues(state: ElectionState): ComputedIssue[] {
  return state.issueRegistry.map((registry) => {
    const voteRows = state.voteData.get(registry.issueName) ?? [];
    return computeIssue(registry, voteRows, state.totalRegisteredVoters);
  });
}

function computeIssue(
  registry: IssueRegistryRow,
  voteRows: VoteRow[],
  totalRegisteredVoters: number | null,
): ComputedIssue {
  const outcomeFields: OutcomeFieldMapping[] = registry.outcomeLabels.map((label, i) => ({
    label,
    field: `outcome_${i + 1}`,
  }));
  const { outcomes, totalVotesCast, winnerStatus } = computeOutcomeResults(registry, voteRows);
  const turnoutPercent = computeTurnout(totalVotesCast, totalRegisteredVoters);
  const ballotWithoutVote = computeBallotWithoutVote(registry, voteRows);

  return {
    registry,
    outcomeFields,
    voteRows,
    outcomes,
    totalVotesCast,
    turnoutPercent,
    ballotWithoutVote,
    winnerStatus,
  };
}

export type IssuesByType = { type: string; label: string; issues: ComputedIssue[] };

export function selectIssuesByType(state: ElectionState): IssuesByType[] {
  const computed = selectComputedIssues(state);

  return ISSUE_TYPE_ORDER
    .map((type) => ({
      type,
      label: SECTION_LABELS[type as keyof typeof SECTION_LABELS] ?? type,
      issues: computed.filter((c) => c.registry.issueType === type),
    }))
    .filter((section) => section.issues.length > 0);
}
