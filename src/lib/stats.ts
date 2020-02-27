import { OwnedPath, Stats } from './types';

export const statsFromOwnedPaths = (paths: OwnedPath[]): Stats => {
  let unloved = 0;
  const ownerCount = new Map<string, number>();

  for (const path of paths) {
    if (path.owners.length < 1) {
      unloved++;
    } else {
      for (const owner of path.owners) {
        const count = ownerCount.get(owner) || 0;
        ownerCount.set(owner, count + 1);
      }
    }
  }

  return {
    count: paths.length,
    unloved: paths.filter(path => path.owners.length < 1).length,
    owners: Array.from(ownerCount.keys()).map((owner) => {
      return { owner, count: ownerCount.get(owner) || 0 };
    }),
  };
};
