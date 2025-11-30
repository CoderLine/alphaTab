import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const beatSpu: PropertyDefinition = {
    property: 'spu',
    snippet: 'spu',
    shortDescription: 'Sustain pedal up',
    longDescription: 'Add a sustain pedal up (release) to the beat.',
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
