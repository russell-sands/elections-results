export const SECTION_LABELS = {
  candidate: import.meta.env.VITE_LABEL_CANDIDATES || 'Candidates for Office',
  'ballot measure': import.meta.env.VITE_LABEL_BALLOT_MEASURES || 'Ballot Measures',
  other: import.meta.env.VITE_LABEL_OTHER || 'Other Issues',
} as const;

export const ISSUE_TYPE_ORDER: readonly string[] = ['candidate', 'ballot measure', 'other'];
