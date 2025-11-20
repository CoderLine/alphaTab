import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const glpt: PropertyDefinition = {
    property: 'glpt',
    snippet: 'glpt',
    shortDescription: 'Golpe (Thumb)',
    longDescription: `Adds a golpe thumb-tap effect to the beat.`,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        3.3{glpf} 3.3{glpt}
        `
};
