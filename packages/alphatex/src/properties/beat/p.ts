import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const p: PropertyDefinition = {
    property: 'p',
    snippet: 'p',
    shortDescription: 'Pop',
    longDescription: 'Adds a bass pop annotation to the beat.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        \\track {instrument "Electric Bass Finger"}
        (3 4) 3.4.8 {s} (5.1 5.2).4 {p}  3.4.8 {s} (5.1 5.2).4 {p}
        `
};
