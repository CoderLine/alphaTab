import type { PropertyDoc } from '@coderline/alphatab-language-server/documentation/types';

export const nh: PropertyDoc = {
    property: 'nh',
    syntax: ['nh'],
    snippet: 'nh',
    shortDescription: 'Natural Harmonic',
    longDescription: `Applies a natural harmonic effect to the note (for fretted instruments).`,
    values: [],
    examples: `
        :8 3.3{nh} 3.3{ah} 3.3{ph} 3.3{th} 3.3{sh}
        `
};
