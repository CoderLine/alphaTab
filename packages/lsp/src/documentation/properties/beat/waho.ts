import type { PropertyDoc } from '@coderline/alphatab-language-server/documentation/types';

export const waho: PropertyDoc = {
    property: 'waho',
    syntax: ['waho'],
    snippet: 'waho',
    shortDescription: 'Wah-Wah (Open)',
    longDescription: `Adds a Wah-pedal opening effect to the beat.`,
    values: [],
    examples: 
        `
        3.3 3.3{waho} 3.3 3.3 {wahc}
        `
};
