export interface OwnedFile {
  path: string;
  lines: number;
  owners: string[];
}

export interface File {
  path: string;
  lines: number;
  owners: string[];
}

export interface FileOwnershipMatcher {
  path: string;
  owners: string[];
  match: Matcher;
}

export type Matcher = (path: string) => boolean;

export enum OUTPUT_FORMAT {
  SIMPLE = 'simple',
  JSONL = 'jsonl',
  CSV = 'csv',
}

export interface Counters {
  files: number;
  lines: number;
}

export interface Stats {
  total: Counters;
  loved: Counters;
  unloved: Counters;
  owners: { owner: string, counters: Counters }[];
}
