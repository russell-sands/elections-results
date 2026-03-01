import styles from './WinnerBadge.module.css';

export default function WinnerBadge() {
  return (
    <span className={styles.badge} aria-label="Winner">
      <span className={styles.icon} aria-hidden="true">&#10003;</span>
      Winner
    </span>
  );
}
