import type { PropertyDoc } from '@coderline/alphatab-lsp/documentation/types';

export const dd: PropertyDoc = {
    property: 'dd',
    syntax: ['dd'],
    snippet: 'dd',
    shortDescription: 'Double Augmentation Dot',
    longDescription: 'Marks the beat with a double augmentation dot.',
    values: [],
    examples: 
        `
        (0.1 2.2 2.3 2.4 0.5).1 { dd }
        `
};
