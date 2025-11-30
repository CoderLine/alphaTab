import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const dd: PropertyDefinition = {
    property: 'dd',
    snippet: 'dd',
    shortDescription: 'Double Augmentation Dot',
    longDescription: 'Marks the beat with a double augmentation dot.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        (0.1 2.2 2.3 2.4 0.5).1 { dd }
        `
};
