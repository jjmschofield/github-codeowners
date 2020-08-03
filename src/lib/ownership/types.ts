export type Matcher = (path: string) => boolean;

export interface FileOwnershipMatcher {
  rule: string;
  path: string;
  owners: string[];
  match: Matcher;
  matched: number;
}
