export type Matcher = (path: string) => boolean;

export interface FileOwnershipMatcher {
  path: string;
  owners: string[];
  match: Matcher;
}
