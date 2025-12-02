import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const psd: PropertyDefinition = {
    property: 'psd',
    snippet: 'psd',
    shortDescription: 'Pick-Slide (downwards)',
    longDescription: 'Adds a pick slide effect out from note downwards.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        3.3{sl} 4.3 3.3{ss} 4.3 |
        3.3{sib} 3.3{psd} 3.3{psd} 3.3{psd} |
        3.3{sib psd} 3.3{sib psd} 3.3{psd psd} 3.3{psd psd} |
        x.3{psd} 3.3 |
        x.3{psd} 3.3 |
        `
};
