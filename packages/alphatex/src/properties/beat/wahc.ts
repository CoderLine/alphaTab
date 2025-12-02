import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const wahc: PropertyDefinition = {
    property: 'wahc',
    snippet: 'wahc',
    shortDescription: 'Wah-Wah (Close)',
    longDescription: `Adds a Wah-pedal close effect to the beat.`,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        3.3 3.3{waho} 3.3 3.3 {wahc}
        `
};
