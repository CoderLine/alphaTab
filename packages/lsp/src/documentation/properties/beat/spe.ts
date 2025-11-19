import type { PropertyDoc } from '@coderline/alphatab-language-server/documentation/types';

export const beatSpe: PropertyDoc = {
    property: 'spe',
    syntax: ['spe'],
    snippet: 'spe',
    shortDescription: 'Sustain pedal up (end)',
    longDescription: 'Add a sustain pedal up (release) to the end of the beat.',
    values: [],
    examples: 
        `
        C4 {spd} C4 {sph} C4 {sph} C4 {spu} |
        C4 {spd} C4 {sph} C4 {sph} C4 {spe}
        `
};
