import type { PropertyDoc } from '@coderline/alphatab-lsp/documentation/types';
import { harmonicValueDocs } from '@coderline/alphatab-lsp/documentation/properties/note/ah';


export const fh: PropertyDoc = {
    property: 'fh',
    syntax: ['fh value'],
    snippet: 'fh$0',
    shortDescription: 'Feedback Harmonic',
    longDescription: `Applies a feedback harmonic effect to the note (for fretted instruments).`,
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
        :8 3.3{fh} 3.3{ah} 3.3{ph} 3.3{th} 3.3{sh}
        `
};
