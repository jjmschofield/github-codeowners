/* tslint:disable */
// TODO - I know this is a mess but I don't have time to do it properly atm
// FIXME - we keep getting bugs here, should probably fix it
export const complicatedThingUntestedThing = (apples: Object[], pears: Object[]) => {
  if (apples) {
    if (pears) {
      if (apples.length > 1) {
        if (pears.length > 1) {
          for (const apple of apples) {
            if (apple) {
              if (pears.includes(apple)) {
                const pear = pears.find(p => p === apple);
                if (!pear) {
                  throw new Error('cannot compare apples and pears');
                } else {
                  return pear === apple;
                }
              } else {
                throw new Error('cannot compare apples and pears');
              }
            }
          }
        }
      }
    }
  }
};
