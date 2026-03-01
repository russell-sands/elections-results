import type { IssueRegistryRow, VoteRow } from '../types/election';
import { fetchAllFeatures } from './arcgis-client';

export async function fetchIssueVoteRows(
  tableUrl: string,
  registry: IssueRegistryRow,
): Promise<VoteRow[]> {
  const outcomeFields = registry.outcomeLabels.map((_, i) => `outcome_${i + 1}`);
  const outFields = [
    'boundary_id',
    'issue_id',
    ...outcomeFields,
    ...(registry.hasTotalVotes ? ['total_votes'] : []),
    ...(registry.hasBallotWoVote ? ['ballot_wo_vote'] : []),
  ];

  const { features } = await fetchAllFeatures({ url: tableUrl, outFields });

  return features.map((f) => {
    const outcomes: Record<string, number> = {};
    for (const field of outcomeFields) {
      outcomes[field] = (f.attributes[field] as number) ?? 0;
    }

    return {
      boundaryId: f.attributes.boundary_id as string,
      issueId: f.attributes.issue_id as string,
      outcomes,
      totalVotes: registry.hasTotalVotes ? (f.attributes.total_votes as number | null) : null,
      ballotWoVote: registry.hasBallotWoVote
        ? (f.attributes.ballot_wo_vote as number | null)
        : null,
    };
  });
}
