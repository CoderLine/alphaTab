import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const extendBarLines: MetadataTagDefinition = {
    tag: '\\extendBarLines',
    snippet: '\\extendBarLines',
    shortDescription: `Extend the bar lines across staves in the same system.`,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        \\extendBarLines
        \\track "Piano1"
          \\staff {score}
        \\instrument piano
          C4 D4 E4 F4
          \\staff {score}
          \\clef f4 C3 D3 E3 F3
        \\track "Piano2"
          \\staff {score}
        \\instrument piano
          C4 D4 E4 F4
        \\track "Flute 1"
          \\staff { score }
        \\instrument flute
          C4 D4 E4 F4
        \\track "Flute 2"
          \\staff { score }
        \\instrument flute
          \\clef f4 C3 D3 E3 F3
        \\track "Guitar 1"
          \\staff { score tabs }
          0.3.4 2.3.4 5.3.4 7.3.4
        `
};
