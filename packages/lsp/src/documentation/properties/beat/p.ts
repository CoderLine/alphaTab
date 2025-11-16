import type { PropertyDoc } from '@src/documentation/types';

export const p: PropertyDoc = {
    property: 'p',
    syntax: ['p'],
    snippet: 'p',
    shortDescription: 'Pop',
    longDescription: 'Adds a bass pop annotation to the beat.',
    values: [],
    examples: 
        `
        \\track {instrument "Electric Bass Finger"}
        (3 4) 3.4.8 {s} (5.1 5.2).4 {p}  3.4.8 {s} (5.1 5.2).4 {p}
        `
};
