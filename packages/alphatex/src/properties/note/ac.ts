import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const noteAccentuation: PropertyDefinition = {
    property: 'ac',
    snippet: 'ac',
    shortDescription: 'Accentuated',
    longDescription: `Applies a simple accentuation to the note.`,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        3.3{ac} 3.3{hac} 3.3{ten}
        `
};
