import type { MetadataDoc } from '../types';

export const multiBarRest: MetadataDoc = {
    tag: '\\multiBarRest',
    syntax: ['\\multiBarRest'],
    snippet: '\\multiBarRest',
    description: `Enable the display of multibar rests in case multiple tracks are shown..`,
    values: [],
    example: `
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
