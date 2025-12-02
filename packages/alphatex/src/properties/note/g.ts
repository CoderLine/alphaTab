import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const g: PropertyDefinition = {
    property: 'g',
    snippet: 'g',
    shortDescription: 'Ghost Note',
    longDescription: `Marks the note as a ghost note.`,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: 
        `
        3.3{g}
        `
};
