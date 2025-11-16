import type { PropertyDoc } from '@src/documentation/types';

export const cre: PropertyDoc = {
    property: 'cre',
    syntax: ['cre'],
    snippet: 'cre',
    shortDescription: 'Crescendo',
    longDescription: 'Adds a crescendo effect to the beat.',
    values: [],
    examples: 
        `
        3.3 { cre } -.3 { cre }
        `
};
