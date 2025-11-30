import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const sl: PropertyDefinition = {
    property: 'sl',
    snippet: 'sl',
    shortDescription: 'Slide (legato)',
    longDescription: 'Adds a legato slide effect to the note.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        3.3{sl} 4.3 3.3{ss} 4.3 |
        3.3{sib} 3.3{sia} 3.3{sou} 3.3{sod} |
        3.3{sib sou} 3.3{sib sod} 3.3{sia sod} 3.3{sia sou} |
        x.3{psd} 3.3 |
        x.3{psu} 3.3 |
        `
};
