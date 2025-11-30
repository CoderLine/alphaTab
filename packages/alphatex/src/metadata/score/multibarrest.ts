import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const multiBarRest: MetadataTagDefinition = {
    tag: '\\multiBarRest',
    snippet: '\\multiBarRest',
    shortDescription: `Show multibar rests when rendering multiple tracks.`,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        \\title "Multi Track"
        \\multiBarRest
        \\track "Piano 1" "pno1"
          \\staff {score}
          C4 D4 E4 F4 | r | r | C4 D4 E4 F4 | r | r | r | C4
        
        \\track "Piano 2" "pno1"
          \\staff {score}
          C4 D4 E4 F4 | r | r | C4 D4 E4 F4 | r | r | r | r |
        `
};
