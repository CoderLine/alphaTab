import type { PropertyDoc } from '@coderline/alphatab-lsp/documentation/types';

export const sou: PropertyDoc = {
    property: 'sou',
    syntax: ['sou'],
    snippet: 'sou',
    shortDescription: 'Slide (out upwards)',
    longDescription: 'Adds a slide effect out from note upwards.',
    values: [],
    examples: 
        `
        3.3{sl} 4.3 3.3{ss} 4.3 |
        3.3{sib} 3.3{sou} 3.3{sou} 3.3{sod} |
        3.3{sib sou} 3.3{sib sod} 3.3{sou sod} 3.3{sou sou} |
        x.3{psd} 3.3 |
        x.3{psu} 3.3 |
        `
};
