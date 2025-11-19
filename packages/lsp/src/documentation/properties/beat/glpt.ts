import type { PropertyDoc } from '@coderline/alphatab-language-server/documentation/types';

export const glpt: PropertyDoc = {
    property: 'glpt',
    syntax: ['glpt'],
    snippet: 'glpt',
    shortDescription: 'Golpe (Thumb)',
    longDescription: `Adds a golpe thumb-tap effect to the beat.`,
    values: [],
    examples: 
        `
        3.3{glpf} 3.3{glpt}
        `
};
