import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const sou: PropertyDefinition = {
    property: 'sou',
    snippet: 'sou',
    shortDescription: 'Slide (out upwards)',
    longDescription: 'Adds a slide effect out from note upwards.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        3.3{sl} 4.3 3.3{ss} 4.3 |
        3.3{sib} 3.3{sou} 3.3{sou} 3.3{sod} |
        3.3{sib sou} 3.3{sib sod} 3.3{sou sod} 3.3{sou sou} |
        x.3{psd} 3.3 |
        x.3{psu} 3.3 |
        `
};
