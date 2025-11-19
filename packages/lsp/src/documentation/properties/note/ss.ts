import type { PropertyDoc } from '@coderline/alphatab-lsp/documentation/types';

export const ss: PropertyDoc = {
    property: 'ss',
    syntax: ['ss'],
    snippet: 'ss',
    shortDescription: 'Slide (shift)',
    longDescription: 'Adds a shift slide effect to the note.',
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
