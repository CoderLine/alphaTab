import type { PropertyDoc } from '@src/documentation/types';

export const psd: PropertyDoc = {
    property: 'psd',
    syntax: ['psd'],
    snippet: 'psd',
    shortDescription: 'Pick-Slide (downwards)',
    longDescription: 'Adds a pick slide effect out from note downwards.',
    values: [],
    examples: 
        `
        3.3{sl} 4.3 3.3{ss} 4.3 |
        3.3{sib} 3.3{psd} 3.3{psd} 3.3{psd} |
        3.3{sib psd} 3.3{sib psd} 3.3{psd psd} 3.3{psd psd} |
        x.3{psd} 3.3 |
        x.3{psd} 3.3 |
        `
};
