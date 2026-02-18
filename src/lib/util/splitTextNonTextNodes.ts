import { ReactNode } from 'react';

interface SplitResult {
  textNodes: ReactNode[];
  nonTextNodes: ReactNode[];
}

export default function splitTextNonTextNodes(children: ReactNode[]): SplitResult {
  return children.reduce(
    (acc, curr) => {
      if (curr && typeof curr === 'object' && 'type' in curr && 
          curr.type && typeof curr.type === 'object' && 'displayName' in curr.type &&
          (curr.type as any).displayName === 'Text') {
        acc.textNodes.push(curr);
      } else {
        acc.nonTextNodes.push(curr);
      }

      return acc;
    },
    { textNodes: [], nonTextNodes: [] } as SplitResult,
  );
}
