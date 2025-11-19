import type { PropertyDoc } from '@coderline/alphatab-lsp/documentation/types';

export const su: PropertyDoc = {
    property: 'su',
    syntax: ['su'],
    snippet: 'su',
    shortDescription: 'Pick-Stroke Up',
    longDescription: 'Adds an upwards pick-stroke annotation to the beat.',
    values: [],
    examples: 
        `
        0.1 { su }
        `
};
