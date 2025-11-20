import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const lht: PropertyDefinition = {
    property: 'lht',
    snippet: 'lht',
    shortDescription: 'Left-Hand tap',
    longDescription: `Applies a left-hand-tapped annotation to the note.`,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        :16 15.1{h} 13.1{h} 12.1{h} 15.2{lht}
        `
};
