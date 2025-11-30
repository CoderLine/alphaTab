import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const x: PropertyDefinition = {
    property: 'x',
    snippet: 'x',
    shortDescription: 'Dead-Note',
    longDescription: `Marks the note as a dead note.`,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: 
        `
        x.3 3.3{x}
        `
};
