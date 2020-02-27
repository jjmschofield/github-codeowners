export interface OwnedPath {
  path: string;
  owners: string[];
}

export interface OwnedPathMatcher extends OwnedPath {
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

export interface Stats {
  count: number;
  unloved: number;
  owners: { owner: string, count: number }[];
}
