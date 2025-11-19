import type { PropertyDoc } from '@coderline/alphatab-language-server/documentation/types';

export const noteAccentuation: PropertyDoc = {
    property: 'ac',
    syntax: ['ac'],
    snippet: 'ac',
    shortDescription: 'Accentuated',
    longDescription: `Applies a simple accentuation to the note.`,
    values: [],
    examples: 
        `
        3.3{ac} 3.3{hac} 3.3{ten}
        `
};
