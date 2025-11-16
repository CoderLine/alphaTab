import type { MetadataDoc } from '@src/documentation/types';

export const multiBarRest: MetadataDoc = {
    tag: '\\multiBarRest',
    syntax: ['\\multiBarRest'],
    snippet: '\\multiBarRest',
    shortDescription: `Show multibar rests when rendering multiple tracks.`,
    values: [],
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
