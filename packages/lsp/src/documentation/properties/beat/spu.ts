import type { PropertyDoc } from '@coderline/alphatab-lsp/documentation/types';

export const beatSpu: PropertyDoc = {
    property: 'spu',
    syntax: ['spu'],
    snippet: 'spu',
    shortDescription: 'Sustain pedal up',
    longDescription: 'Add a sustain pedal up (release) to the beat.',
    values: [],
    examples: 
        `
        C4 {spd} C4 {sph} C4 {sph} C4 {spu} |
        C4 {spd} C4 {sph} C4 {sph} C4 {spe}
        `
};
