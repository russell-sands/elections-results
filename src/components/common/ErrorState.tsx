import styles from './ErrorState.module.css';

interface ErrorStateProps {
  message: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className={styles.container} role="alert">
      <h2 className={styles.title}>Unable to load results</h2>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
