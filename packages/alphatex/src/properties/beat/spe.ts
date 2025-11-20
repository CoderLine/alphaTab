import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const beatSpe: PropertyDefinition = {
    property: 'spe',
    snippet: 'spe',
    shortDescription: 'Sustain pedal up (end)',
    longDescription: 'Add a sustain pedal up (release) to the end of the beat.',
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
