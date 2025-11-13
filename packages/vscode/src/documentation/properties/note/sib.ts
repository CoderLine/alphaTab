import type { PropertyDoc } from '../../types';

export const sib: PropertyDoc = {
    property: 'sib',
    syntax: ['sib'],
    snippet: 'sib',
    shortDescription: 'Slide (into from-below)',
    longDescription: 'Adds a slide effect into the note from below.',
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
