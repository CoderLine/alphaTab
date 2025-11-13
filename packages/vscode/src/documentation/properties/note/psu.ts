import type { PropertyDoc } from '../../types';

export const psu: PropertyDoc = {
    property: 'psu',
    syntax: ['psu'],
    snippet: 'psu',
    shortDescription: 'Pick-Slide (upwards)',
    longDescription: 'Adds a pick slide effect out from note upwards.',
    values: [],
    examples: 
        `
        3.3{sl} 4.3 3.3{ss} 4.3 |
        3.3{sib} 3.3{psu} 3.3{psu} 3.3{psu} |
        3.3{sib psu} 3.3{sib psu} 3.3{psu psu} 3.3{psu psu} |
        x.3{psd} 3.3 |
        x.3{psu} 3.3 |
        `
};
