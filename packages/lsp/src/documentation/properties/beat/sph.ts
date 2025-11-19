import type { PropertyDoc } from '@coderline/alphatab-language-server/documentation/types';

export const beatSph: PropertyDoc = {
    property: 'sph',
    syntax: ['sph'],
    snippet: 'sph',
    shortDescription: 'Sustain pedal hold',
    longDescription: 'Add a sustain pedal hold to the beat.',
    values: [],
    examples: 
        `
        C4 {spd} C4 {sph} C4 {sph} C4 {spu} |
        C4 {spd} C4 {sph} C4 {sph} C4 {spe}
        `
};
