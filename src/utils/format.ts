export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatVoteCount(value: number): string {
  return value.toLocaleString('en-US');
}
