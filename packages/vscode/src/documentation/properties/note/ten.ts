import type { PropertyDoc } from '../../types';

export const ten: PropertyDoc = {
    property: 'ten',
    syntax: ['ten'],
    snippet: 'ten',
    shortDescription: 'Tenuto',
    longDescription: `Applies a tenuto accentuation to the note.`,
    values: [],
    examples: 
        `
        3.3{ac} 3.3{ten} 3.3{ten}
        `
};
