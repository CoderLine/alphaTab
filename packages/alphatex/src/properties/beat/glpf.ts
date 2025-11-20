import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const glpf: PropertyDefinition = {
    property: 'glpf',
    snippet: 'glpf',
    shortDescription: 'Golpe (Finger)',
    longDescription: `Adds a golpe finger-tap effect to the beat.`,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        3.3{glpf} 3.3{glpt}
        `
};
