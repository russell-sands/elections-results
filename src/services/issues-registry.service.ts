import type { IssueRegistryRow } from '../types/election';
import { fetchAllFeatures, hasField } from './arcgis-client';

export async function fetchIssuesRegistry(url: string): Promise<IssueRegistryRow[]> {
  const { features, fields } = await fetchAllFeatures({ url });

  const hasInternalId = hasField(fields, 'internal_id');

  return features.map((f) => {
    const rawLabels = f.attributes.outcome_labels as string | null;
    let outcomeLabels: string[] = [];
    if (rawLabels) {
      try {
        outcomeLabels = JSON.parse(rawLabels) as string[];
      } catch {
        console.error('[elections-viewer] Failed to parse outcome_labels for', f.attributes.issue_name, rawLabels);
      }
    }
    return {
      globalId: f.attributes.GlobalID as string,
      internalId: hasInternalId ? (f.attributes.internal_id as string | null) : null,
      issueName: f.attributes.issue_name as string,
      issueDescription: f.attributes.issue_description as string | null,
      issueUrl: f.attributes.issue_url as string,
      issueType: f.attributes.issue_type as 'candidate' | 'ballot measure' | 'other',
      winThreshold: f.attributes.win_threshold as number | null,
      outcomeLabels,
      hasTotalVotes: (f.attributes.has_total_votes as number) === 1,
      hasBallotWoVote: (f.attributes.has_ballot_wo_vote as number) === 1,
    };
  });
}
