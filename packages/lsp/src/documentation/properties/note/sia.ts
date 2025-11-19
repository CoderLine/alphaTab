import type { PropertyDoc } from '@coderline/alphatab-language-server/documentation/types';

export const sia: PropertyDoc = {
    property: 'sia',
    syntax: ['sia'],
    snippet: 'sia',
    shortDescription: 'Slide (into from-above)',
    longDescription: 'Adds a slide effect into the note from above.',
    values: [],
    examples: 
        `
        3.3{sl} 4.3 3.3{ss} 4.3 |
        3.3{sib} 3.3{sia} 3.3{sou} 3.3{sod} |
        3.3{sib sou} 3.3{sib sod} 3.3{sia sod} 3.3{sia sou} |
        x.3{psd} 3.3 |
        x.3{psu} 3.3 |
        `
};
