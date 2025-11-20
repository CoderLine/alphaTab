import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const h: PropertyDefinition = {
    property: 'h',
    snippet: 'h',
    shortDescription: 'Hammer-On/Pull-Off',
    longDescription: `
    Applies a hammer on / pull-off effect to the note.

    The fret of the following note on the same string defines whether it is a hammer-on or pull-of.
    `,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        3.3{h} 4.3 4.3{h} 3.3 | 3.3{h} 4.3{h} 3.3{h} 4.3
        `
};
