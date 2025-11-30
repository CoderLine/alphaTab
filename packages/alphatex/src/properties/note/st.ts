import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const st: PropertyDefinition = {
    property: 'st',
    snippet: 'st',
    shortDescription: 'Staccato',
    longDescription: `Applies a staccato effect to the note.`,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        3.3{st}
        `
};
