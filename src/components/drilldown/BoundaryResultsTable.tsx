import type { ComputedIssue, Boundary } from '../../types/election';
import { formatVoteCount, formatPercent } from '../../utils/format';
import styles from './BoundaryResultsTable.module.css';

interface BoundaryResultsTableProps {
  issue: ComputedIssue;
  boundaries: Boundary[];
  boundaryColumnHeader: string;
  selectedBoundaryId: string | null;
  onSelectBoundary: (id: string | null) => void;
}

export default function BoundaryResultsTable({
  issue,
  boundaries,
  boundaryColumnHeader,
  selectedBoundaryId,
  onSelectBoundary,
}: BoundaryResultsTableProps) {
  const boundaryMap = new Map(boundaries.map((b) => [b.globalId, b]));

  const visibleRows = selectedBoundaryId
    ? issue.voteRows.filter((r) => r.boundaryId === selectedBoundaryId)
    : issue.voteRows;

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{boundaryColumnHeader}</th>
            {issue.outcomeFields.map((o) => (
              <th key={o.field} className={styles.numericHeader}>
                {o.label}
              </th>
            ))}
            <th className={styles.numericHeader}>Total</th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row) => {
            const boundary = boundaryMap.get(row.boundaryId);
            const boundaryName = boundary?.internalId ?? row.boundaryId;
            const rowTotal = issue.outcomeFields.reduce(
              (sum, o) => sum + (row.outcomes[o.field] ?? 0),
              0,
            );
            const isSelected = row.boundaryId === selectedBoundaryId;

            return (
              <tr
                key={row.boundaryId}
                className={`${styles.clickableRow} ${isSelected ? styles.selectedRow : ''}`}
                onClick={() => onSelectBoundary(row.boundaryId)}
              >
                <td>{boundaryName}</td>
                {issue.outcomeFields.map((o) => {
                  const votes = row.outcomes[o.field] ?? 0;
                  const share = rowTotal > 0 ? votes / rowTotal : 0;
                  return (
                    <td key={o.field} className={styles.numericCell}>
                      {formatVoteCount(votes)}{' '}
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                        ({formatPercent(share)})
                      </span>
                    </td>
                  );
                })}
                <td className={styles.numericCell}>{formatVoteCount(rowTotal)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
