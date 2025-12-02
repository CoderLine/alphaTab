import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const beatSph: PropertyDefinition = {
    property: 'sph',
    snippet: 'sph',
    shortDescription: 'Sustain pedal hold',
    longDescription: 'Add a sustain pedal hold to the beat.',
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
