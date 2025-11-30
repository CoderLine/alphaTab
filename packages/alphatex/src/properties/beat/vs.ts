import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const vs: PropertyDefinition = {
    property: 'vs',
    snippet: 'vs',
    shortDescription: 'Volume-Swell',
    longDescription: 'Adds a volume-swell effect to the beat. Applies to all notes.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        (0.1 2.2 2.3 2.4 0.5).1 { vs }
        `
};
