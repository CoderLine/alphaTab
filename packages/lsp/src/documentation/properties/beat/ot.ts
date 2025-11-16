import * as alphaTab from '@coderline/alphatab';
import type { PropertyDoc, ValueItemDoc } from '@src/documentation/types';

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
            values: new Map<alphaTab.importer.alphaTex.AlphaTexNodeType, ValueItemDoc[]>([
                [
                    alphaTab.importer.alphaTex.AlphaTexNodeType.Ident,
                    [
                        { name: '15ma', snippet: '15ma', shortDescription: '' },
                        { name: '8va', snippet: '8va', shortDescription: '' },
                        { name: 'regular', snippet: 'regular', shortDescription: '' },
                        { name: '8vb', snippet: '8vb', shortDescription: '' },
                        { name: '15mb', snippet: '15mb', shortDescription: '' }
                    ]
                ]
            ])
        }
    ],
    examples: `
        3.3.4{ ot 15ma } 3.3.4{ ot 8vb }
        `
};
