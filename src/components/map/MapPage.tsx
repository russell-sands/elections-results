import { useElectionState } from '../../state/election-context';
import LoadingState from '../common/LoadingState';
import ErrorState from '../common/ErrorState';

import ElectionMap from './ElectionMap';
import styles from './MapPage.module.css';

export default function MapPage() {
  const state = useElectionState();

  if (state.status === 'loading' || state.status === 'idle') {
    return <LoadingState />;
  }

  if (state.status === 'error') {
    return <ErrorState message={state.error ?? 'An unknown error occurred'} />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.mapContainer}>
        <ElectionMap />
      </div>
    </div>
  );
}
