import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const lr: PropertyDefinition = {
    property: 'lr',
    snippet: 'lr',
    shortDescription: 'LetRing',
    longDescription: `Applies a LetRing effect to the note.`,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        3.4{lr} 3.3{lr} 3.2{lr} 3.1{lr}
        `
};
