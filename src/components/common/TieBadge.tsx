import styles from './TieBadge.module.css';

export default function TieBadge() {
  return (
    <span className={styles.badge} aria-label="Tie">
      Tie
    </span>
  );
}
