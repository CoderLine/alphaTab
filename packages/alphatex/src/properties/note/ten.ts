import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const ten: PropertyDefinition = {
    property: 'ten',
    snippet: 'ten',
    shortDescription: 'Tenuto',
    longDescription: `Applies a tenuto accentuation to the note.`,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        3.3{ac} 3.3{ten} 3.3{ten}
        `
};
