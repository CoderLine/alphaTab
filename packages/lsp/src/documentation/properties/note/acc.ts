import * as alphaTab from '@coderline/alphatab';
import type { PropertyDoc, ValueItemDoc } from '@src/documentation/types';

export const acc: PropertyDoc = {
    property: 'acc',
    syntax: ['acc mode'],
    snippet: 'acc $1$0',
    shortDescription: 'Accidentals',
    longDescription: `Changes the mode to determine the accidentals for this note.`,
    values: [
        {
            name: 'mode',
            shortDescription: 'The accidental mode',
            type: '`identifier`',
            required: true,
            values: new Map<alphaTab.importer.alphaTex.AlphaTexNodeType, ValueItemDoc[]>([
                [
                    alphaTab.importer.alphaTex.AlphaTexNodeType.Ident,
                    [
                        { name: 'd', snippet: 'd', shortDescription: 'Auto-detect the accidentals' },
                        { name: '-', snippet: '-', shortDescription: 'Force no accidentals' },
                        { name: 'n', snippet: 'n', shortDescription: 'Force a naturalize accidental' },
                        { name: '#', snippet: '#', shortDescription: 'Force a sharp accidental' },
                        { name: 'x', snippet: 'x', shortDescription: 'Force a double-sharp accidental' },
                        { name: '#', snippet: '#', shortDescription: 'Force a flat accidental' },
                        { name: '#', snippet: '#', shortDescription: 'Force a double flat accidental' },
                        { name: 'd', snippet: 'd', shortDescription: 'Auto-detect the accidentals' },
                        { name: 'forceNone', snippet: 'forceNone', shortDescription: 'Force no accidentals' },
                        { name: 'forceNatural', snippet: 'forceNatural', shortDescription: 'Force a naturalize accidental' },
                        { name: 'forceSharp', snippet: 'forceSharp', shortDescription: 'Force a sharp accidental' },
                        { name: '##', snippet: '##', shortDescription: 'Force a double-sharp accidental' },
                        { name: 'forceDoubleSharp', snippet: 'forceDoubleSharp', shortDescription: 'Force a double-sharp accidental' },
                        { name: 'forceFlat', snippet: 'forceFlat', shortDescription: 'Force a flat accidental' },
                        { name: 'forceDoubleFlat', snippet: 'forceDoubleFlat', shortDescription: 'Force a double flat accidental' },
                    ]
                ]
            ])
        }
    ],
    examples: `
        :8 3.3{lf 1} 3.3{lf 2} 3.3{lf 3} 3.3{lf 4} 3.3{lf 5} (2.2{lf 4} 2.3{lf 3} 2.4{lf 2}) |
        :8 3.3{rf 1} 3.3{rf 2} 3.3{rf 3} 3.3{rf 4} 3.3{lf 5}
        `
};
