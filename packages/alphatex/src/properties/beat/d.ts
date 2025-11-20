import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const d: PropertyDefinition = {
    property: 'd',
    snippet: 'd',
    shortDescription: 'Augmentation Dot',
    longDescription: 'Marks the beat with a single augmentation dot.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        (0.1 2.2 2.3 2.4 0.5).1 { d }
        `
};
