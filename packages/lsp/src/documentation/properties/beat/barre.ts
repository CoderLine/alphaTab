import * as alphaTab from '@coderline/alphatab';
import type { PropertyDoc, ValueItemDoc } from '@coderline/alphatab-lsp/documentation/types';

export const barre: PropertyDoc = {
    property: 'barre',
    syntax: ['barre fret', 'barre (fret mode)'],
    snippet: 'barre $1$0',
    shortDescription: 'Barré',
    longDescription: `Add a barré chord notation to the beat.`,
    values: [
        {
            name: 'fret',
            shortDescription: 'The numeric fret for the barre chord',
            type: '`number`',
            required: true
        },
        {
            name: 'mode',
            shortDescription: 'The barre mode',
            type: '`identifier`',
            required: true,
            values: new Map<alphaTab.importer.alphaTex.AlphaTexNodeType, ValueItemDoc[]>([
                [alphaTab.importer.alphaTex.AlphaTexNodeType.Ident, ['Full', 'Half'].map(s => ({ name: s, snippet: s.toLowerCase(), shortDescription: '' }))]
            ])
        }
    ],
    examples: `
        1.1 {barre 24} 2.1 {barre 24} 3.1 {barre 24} 4.1 |
        1.1 {barre 4 half} 2.1 {barre 4 half} 3.1 {barre 4 half} 4.1 {barre 4 half} |
        `
};
