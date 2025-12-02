import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const waho: PropertyDefinition = {
    property: 'waho',
    snippet: 'waho',
    shortDescription: 'Wah-Wah (Open)',
    longDescription: `Adds a Wah-pedal opening effect to the beat.`,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        3.3 3.3{waho} 3.3 3.3 {wahc}
        `
};
