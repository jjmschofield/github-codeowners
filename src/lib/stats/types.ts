export interface File {
  path: string;
  lines?: number;
  owners: string[];
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
