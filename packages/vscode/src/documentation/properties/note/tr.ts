import { harmonicValueDocs } from './ah';
import type { PropertyDoc, ValueItemDoc } from '../../types';
import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';

export const tr: PropertyDoc = {
    property: 'tr',
    syntax: ['tr fret', 'tr (fret duration)'],
    snippet: 'tr$0',
    shortDescription: 'Trill',
    longDescription: `Applies a trill effect to the note.`,
    values: [
        {
            name: 'fret',
            shortDescription: 'The fret on which to trill',
            type: '`number`',
            required: true
        },
        {
            name: 'duration',
            shortDescription: 'The duration/speed of the trills',
            type: '`number`',
            values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                [
                    AlphaTexNodeType.Number,
                    [
                        { name: '16', snippet: '16', shortDescription: '16th Note' },
                        { name: '32', snippet: '32', shortDescription: '32nd Note' },
                        { name: '64', snippet: '64', shortDescription: '64th Note' }
                    ]
                ]
            ]),
            defaultValue: '16',
            required: false
        }
    ],
    valueRemarks: harmonicValueDocs,
    examples: `
        :4 3.3{tr 4} 3.3{tr 4 16} 3.3{tr 5 32} 3.3{tr 6 64}
        `
};
6