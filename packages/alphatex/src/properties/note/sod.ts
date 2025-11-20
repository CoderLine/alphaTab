import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const sod: PropertyDefinition = {
    property: 'sod',
    snippet: 'sod',
    shortDescription: 'Slide (out downwards)',
    longDescription: 'Adds a slide effect out from note downwards.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        3.3{sl} 4.3 3.3{ss} 4.3 |
        3.3{sib} 3.3{sod} 3.3{sod} 3.3{sod} |
        3.3{sib sod} 3.3{sib sod} 3.3{sod sod} 3.3{sod sod} |
        x.3{psd} 3.3 |
        x.3{psu} 3.3 |
        `
};
