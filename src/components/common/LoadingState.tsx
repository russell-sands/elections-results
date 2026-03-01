import styles from './LoadingState.module.css';

export default function LoadingState() {
  return (
    <div className={styles.container} role="status" aria-label="Loading election data">
      <div className={styles.spinner} />
      <p className={styles.text}>Loading election results&hellip;</p>
    </div>
  );
}
