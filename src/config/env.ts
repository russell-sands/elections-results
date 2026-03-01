export const envConfig = {
  electionName: import.meta.env.VITE_ELECTION_NAME ?? 'Election Results',
  jurisdictionName: import.meta.env.VITE_JURISDICTION_NAME ?? '',
  logoUrl: import.meta.env.VITE_LOGO_URL ?? '',
  boundariesLayerUrl: import.meta.env.VITE_BOUNDARIES_LAYER_URL ?? '',
  issuesRegistryTableUrl: import.meta.env.VITE_ISSUES_REGISTRY_TABLE_URL ?? '',
} as const;
