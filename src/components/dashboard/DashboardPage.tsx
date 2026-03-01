import { useElectionState } from '../../state/election-context';
import { selectIssuesByType } from '../../state/election-selectors';
import LoadingState from '../common/LoadingState';
import ErrorState from '../common/ErrorState';
import IssueSection from './IssueSection';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const state = useElectionState();

  if (state.status === 'loading' || state.status === 'idle') {
    return <LoadingState />;
  }

  if (state.status === 'error') {
    return <ErrorState message={state.error ?? 'An unknown error occurred'} />;
  }

  const sections = selectIssuesByType(state);

  let cumulativeIssueCount = 0;

  return (
    <div className={styles.page}>
      {sections.map((section) => {
        const baseDelay = cumulativeIssueCount * 80;
        cumulativeIssueCount += section.issues.length;
        return (
          <IssueSection
            key={section.type}
            label={section.label}
            issues={section.issues}
            baseDelay={baseDelay}
          />
        );
      })}
      {sections.length === 0 && (
        <ErrorState message="No election issues found. Check your environment configuration." />
      )}
    </div>
  );
}
