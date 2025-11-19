import type { PropertyDoc } from '@coderline/alphatab-language-server/documentation/types';

export const lr: PropertyDoc = {
    property: 'lr',
    syntax: ['lr'],
    snippet: 'lr',
    shortDescription: 'LetRing',
    longDescription: `Applies a LetRing effect to the note.`,
    values: [],
    examples: 
        `
        3.4{lr} 3.3{lr} 3.2{lr} 3.1{lr}
        `
};
