import type { PropertyDoc } from '@coderline/alphatab-language-server/documentation/types';

export const h: PropertyDoc = {
    property: 'h',
    syntax: ['h'],
    snippet: 'h',
    shortDescription: 'Hammer-On/Pull-Off',
    longDescription: `
    Applies a hammer on / pull-off effect to the note.

    The fret of the following note on the same string defines whether it is a hammer-on or pull-of.
    `,
    values: [],
    examples: 
        `
        3.3{h} 4.3 4.3{h} 3.3 | 3.3{h} 4.3{h} 3.3{h} 4.3
        `
};
