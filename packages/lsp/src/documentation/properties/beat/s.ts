import type { PropertyDoc } from '@coderline/alphatab-lsp/documentation/types';

export const s: PropertyDoc = {
    property: 's',
    syntax: ['s'],
    snippet: 's',
    shortDescription: 'Slap',
    longDescription: 'Adds a bass slap annotation to the beat.',
    values: [],
    examples: 
        `
        \\track {instrument "Electric Bass Finger"}
        (3 4) 3.4.8 {s} (5.1 5.2).4 {p}  3.4.8 {s} (5.1 5.2).4 {p}
        `
};
