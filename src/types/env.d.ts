/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ELECTION_NAME?: string;
  readonly VITE_JURISDICTION_NAME?: string;
  readonly VITE_LOGO_URL?: string;
  readonly VITE_LABEL_CANDIDATES?: string;
  readonly VITE_LABEL_BALLOT_MEASURES?: string;
  readonly VITE_LABEL_OTHER?: string;
  readonly VITE_BOUNDARIES_LAYER_URL: string;
  readonly VITE_ISSUES_REGISTRY_TABLE_URL: string;
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
