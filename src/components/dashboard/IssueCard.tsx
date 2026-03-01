import { useNavigate } from 'react-router';
import type { ComputedIssue } from '../../types/election';
import { formatPercent, formatVoteCount } from '../../utils/format';
import OutcomeBarChart from './OutcomeBarChart';
import styles from './IssueCard.module.css';

interface IssueCardProps {
  issue: ComputedIssue;
  animationDelay: number;
}

export default function IssueCard({ issue, animationDelay }: IssueCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/issue/${issue.registry.globalId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(`/issue/${issue.registry.globalId}`);
    }
  };

  return (
    <article
      className={styles.card}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="link"
      aria-label={`View details for ${issue.registry.issueName}`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <h3 className={styles.issueName}>{issue.registry.issueName}</h3>
      {issue.registry.issueDescription && (
        <p className={styles.issueDescription}>{issue.registry.issueDescription}</p>
      )}
      <OutcomeBarChart
        outcomes={issue.outcomes}
        registry={issue.registry}
        winnerStatus={issue.winnerStatus}
      />
      <div className={styles.meta}>
        <span className={styles.metaItem}>
          <span className={styles.metaLabel}>Total votes</span>
          <span className={styles.metaValue}>{formatVoteCount(issue.totalVotesCast)}</span>
        </span>
        {issue.turnoutPercent != null && (
          <span className={styles.metaItem}>
            <span className={styles.metaLabel}>Turnout</span>
            <span className={styles.metaValue}>{formatPercent(issue.turnoutPercent)}</span>
          </span>
        )}
        {issue.ballotWithoutVote != null && (
          <span className={styles.metaItem}>
            <span className={styles.metaLabel}>Ballots w/o vote</span>
            <span className={styles.metaValue}>{formatVoteCount(issue.ballotWithoutVote)}</span>
          </span>
        )}
      </div>
    </article>
  );
}
