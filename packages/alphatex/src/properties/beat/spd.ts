import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const beatSpd: PropertyDefinition = {
    property: 'spd',
    snippet: 'spd',
    shortDescription: 'Sustain pedal down',
    longDescription: 'Add a sustain pedal down-press to the beat.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        C4 {spd} C4 {sph} C4 {sph} C4 {spu} |
        C4 {spd} C4 {sph} C4 {sph} C4 {spe}
        `
};
