import { useParams, Link } from 'react-router';
import { useElectionState } from '../../state/election-context';
import { selectComputedIssues } from '../../state/election-selectors';
import LoadingState from '../common/LoadingState';
import ErrorState from '../common/ErrorState';
import PlaceholderNotice from '../common/PlaceholderNotice';
import BoundaryResultsTable from './BoundaryResultsTable';
import styles from './DrilldownPage.module.css';

export default function DrilldownPage() {
  const { issueId } = useParams<{ issueId: string }>();
  const state = useElectionState();

  if (state.status === 'loading' || state.status === 'idle') {
    return <LoadingState />;
  }

  if (state.status === 'error') {
    return <ErrorState message={state.error ?? 'An unknown error occurred'} />;
  }

  const computedIssues = selectComputedIssues(state);
  const issue = computedIssues.find((c) => c.registry.globalId === issueId);

  if (!issue) {
    return <ErrorState message={`Issue not found: ${issueId}`} />;
  }

  const boundaryColumnHeader = state.boundariesHaveInternalId
    ? (state.boundaryInternalIdAlias ?? 'Boundary')
    : 'Boundary ID';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/" className={styles.backLink}>
          &larr; Back
        </Link>
        <h1 className={styles.issueName}>{issue.registry.issueName}</h1>
        <PlaceholderNotice />
      </div>
      <BoundaryResultsTable
        issue={issue}
        boundaries={state.boundaries}
        boundaryColumnHeader={boundaryColumnHeader}
      />
    </div>
  );
}
