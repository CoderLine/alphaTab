import type { PropertyDoc } from '@coderline/alphatab-language-server/documentation/types';

export const beatSpd: PropertyDoc = {
    property: 'spd',
    syntax: ['spd'],
    snippet: 'spd',
    shortDescription: 'Sustain pedal down',
    longDescription: 'Add a sustain pedal down-press to the beat.',
    values: [],
    examples: 
        `
        C4 {spd} C4 {sph} C4 {sph} C4 {spu} |
        C4 {spd} C4 {sph} C4 {sph} C4 {spe}
        `
};
