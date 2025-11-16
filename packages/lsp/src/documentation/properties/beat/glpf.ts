import type { PropertyDoc } from '@src/documentation/types';

export const glpf: PropertyDoc = {
    property: 'glpf',
    syntax: ['glpf'],
    snippet: 'glpf',
    shortDescription: 'Golpe (Finger)',
    longDescription: `Adds a golpe finger-tap effect to the beat.`,
    values: [],
    examples: 
        `
        3.3{glpf} 3.3{glpt}
        `
};
