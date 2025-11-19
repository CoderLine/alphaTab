import type { PropertyDoc } from '@coderline/alphatab-language-server/documentation/types';

export const d: PropertyDoc = {
    property: 'd',
    syntax: ['d'],
    snippet: 'd',
    shortDescription: 'Augmentation Dot',
    longDescription: 'Marks the beat with a single augmentation dot.',
    values: [],
    examples: 
        `
        (0.1 2.2 2.3 2.4 0.5).1 { d }
        `
};
