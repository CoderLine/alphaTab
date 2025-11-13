import { harmonicValueDocs } from './ah';
import type { PropertyDoc } from '../../types';


export const ph: PropertyDoc = {
    property: 'ph',
    syntax: ['ph value'],
    snippet: 'ph$0',
    shortDescription: 'Pinch Harmonic',
    longDescription: `Applies a pinch harmonic effect to the note (for fretted instruments).`,
    values: [
        {
            name: 'value',
            shortDescription: 'The harmonic value',
            type: '`number`',
            required: false
        }
    ],
    valueRemarks: harmonicValueDocs,
    examples: `
        :8 3.3{nh} 3.3{ah} 3.3{ph} 3.3{th} 3.3{sh}
        `
};
