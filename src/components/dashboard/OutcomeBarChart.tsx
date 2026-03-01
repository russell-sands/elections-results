import type { OutcomeResult, IssueRegistryRow } from '../../types/election';
import { formatPercent, formatVoteCount } from '../../utils/format';
import WinnerBadge from '../common/WinnerBadge';
import TieBadge from '../common/TieBadge';
import styles from './OutcomeBarChart.module.css';

interface OutcomeBarChartProps {
  outcomes: OutcomeResult[];
  registry: IssueRegistryRow;
  winnerStatus: string;
}

function getBarClass(
  outcome: OutcomeResult,
  issueType: string,
): string {
  if (outcome.isTied) return styles.barTie ?? '';
  if (issueType === 'ballot measure') {
    const labelLower = outcome.label.toLowerCase();
    if (labelLower === 'yes') return (outcome.isWinner ? styles.barYes : styles.barLose) ?? '';
    if (labelLower === 'no') return (outcome.isWinner ? styles.barNo : styles.barLose) ?? '';
  }
  return (outcome.isWinner ? styles.barWin : styles.barLose) ?? '';
}

export default function OutcomeBarChart({ outcomes, registry, winnerStatus }: OutcomeBarChartProps) {
  const threshold = registry.winThreshold;

  return (
    <div className={styles.container} role="list" aria-label="Election results">
      {outcomes.map((outcome) => (
        <div key={outcome.field} className={styles.row} role="listitem">
          <div className={styles.labelRow}>
            <span
              className={`${styles.label} ${
                outcome.isWinner ? styles.labelWinner : ''
              }`}
            >
              {outcome.label}
              {outcome.isWinner && (
                <span className={styles.badge}>
                  <WinnerBadge />
                </span>
              )}
              {outcome.isTied && (
                <span className={styles.badge}>
                  <TieBadge />
                </span>
              )}
            </span>
            <span className={styles.stats}>
              <span className={styles.percent}>{formatPercent(outcome.share)}</span>
              <span className={styles.votes}>{formatVoteCount(outcome.votes)}</span>
            </span>
          </div>
          <div
            className={styles.barTrack}
            role="meter"
            aria-valuenow={Math.round(outcome.share * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${outcome.label}: ${formatPercent(outcome.share)}`}
          >
            <div
              className={`${styles.barFill} ${getBarClass(outcome, registry.issueType)}`}
              style={{ width: `${outcome.share * 100}%` }}
            />
            {threshold != null && (
              <>
                <div
                  className={styles.thresholdLine}
                  style={{ left: `${threshold * 100}%` }}
                />
                <span
                  className={styles.thresholdLabel}
                  style={{ left: `${threshold * 100}%` }}
                >
                  {Math.round(threshold * 100)}% required
                </span>
              </>
            )}
          </div>
        </div>
      ))}
      {winnerStatus === 'threshold-not-met' && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            color: 'var(--color-text-muted)',
            fontStyle: 'italic',
          }}
        >
          No winner — threshold not met
        </p>
      )}
    </div>
  );
}
