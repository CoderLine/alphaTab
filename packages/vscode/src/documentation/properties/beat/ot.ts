import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import type { PropertyDoc, ValueItemDoc } from '../../types';

export const ot: PropertyDoc = {
    property: 'ot',
    syntax: ['ot value'],
    snippet: 'ot $1$0',
    shortDescription: 'Ottava',
    longDescription: `Adds a octave change (ottava) to the beat.`,
    values: [
        {
            name: 'value',
            shortDescription: 'The octave shift to apply',
            type: '`identifier`',
            required: true,
            values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                [
                    AlphaTexNodeType.Ident,
                    [
                        { name: '15ma', snippet: '15ma' },
                        { name: '8va', snippet: '8va' },
                        { name: 'regular', snippet: 'regular' },
                        { name: '8vb', snippet: '8vb' },
                        { name: '15mb', snippet: '15mb' }
                    ]
                ]
            ])
        }
    ],
    examples: `
        3.3.4{ ot 15ma } 3.3.4{ ot 8vb }
        `
};
