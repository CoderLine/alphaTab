import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import type { PropertyDoc, ValueItemDoc } from '../../types';

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
            values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                [AlphaTexNodeType.Ident, ['Full', 'Half'].map(s => ({ name: s, snippet: s.toLowerCase() }))]
            ])
        }
    ],
    examples: `
        1.1 {barre 24} 2.1 {barre 24} 3.1 {barre 24} 4.1 |
        1.1 {barre 4 half} 2.1 {barre 4 half} 3.1 {barre 4 half} 4.1 {barre 4 half} |
        `
};
