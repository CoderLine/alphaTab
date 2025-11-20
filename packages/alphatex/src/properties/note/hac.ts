import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const hac: PropertyDefinition = {
    property: 'hac',
    snippet: 'hac',
    shortDescription: 'Heavy-Accentuated',
    longDescription: `Applies a heavy accentuation to the note.`,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        3.3{ac} 3.3{hac} 3.3{ten}
        `
};
