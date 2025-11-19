import type { PropertyDoc } from '@coderline/alphatab-language-server/documentation/types';

export const lht: PropertyDoc = {
    property: 'lht',
    syntax: ['lht'],
    snippet: 'lht',
    shortDescription: 'Left-Hand tap',
    longDescription: `Applies a left-hand-tapped annotation to the note.`,
    values: [],
    examples: 
        `
        :16 15.1{h} 13.1{h} 12.1{h} 15.2{lht}
        `
};
