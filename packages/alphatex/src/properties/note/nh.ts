import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const nh: PropertyDefinition = {
    property: 'nh',
    snippet: 'nh',
    shortDescription: 'Natural Harmonic',
    longDescription: `Applies a natural harmonic effect to the note (for fretted instruments).`,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        :8 3.3{nh} 3.3{ah} 3.3{ph} 3.3{th} 3.3{sh}
        `
};
