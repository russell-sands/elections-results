import type { ComputedIssue } from '../../types/election';
import IssueCard from './IssueCard';
import styles from './IssueSection.module.css';

interface IssueSectionProps {
  label: string;
  issues: ComputedIssue[];
  baseDelay: number;
}

export default function IssueSection({ label, issues, baseDelay }: IssueSectionProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.header}>{label}</h2>
      <div className={styles.grid}>
        {issues.map((issue, i) => (
          <IssueCard
            key={issue.registry.globalId || issue.registry.issueName}
            issue={issue}
            animationDelay={baseDelay + i * 80}
          />
        ))}
      </div>
    </section>
  );
}
