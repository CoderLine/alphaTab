import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import type { PropertyDoc, ValueItemDoc } from '../../types';

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
            values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                [
                    AlphaTexNodeType.Ident,
                    [
                        { name: 'Default (d)', snippet: 'd', shortDescription: 'Auto-detect the accidentals' },
                        { name: 'Force No Accidental (-)', snippet: '-', shortDescription: 'Force no accidentals' },
                        { name: 'Force Natural (n)', snippet: 'n', shortDescription: 'Force a naturalize accidental' },
                        { name: 'Force Sharp (#)', snippet: '#', shortDescription: 'Force a sharp accidental' },
                        { name: 'Force Double-Sharp (x)', snippet: 'x', shortDescription: 'Force a double-sharp accidental' },
                        { name: 'Force Flat (b)', snippet: '#', shortDescription: 'Force a flat accidental' },
                        { name: 'Force Double-Flat (bb)', snippet: '#', shortDescription: 'Force a double flat accidental' },
                        { name: 'Default (default)', snippet: 'd', shortDescription: 'Auto-detect the accidentals' },
                        { name: 'Force No Accidental (forceNone)', snippet: 'forceNone', shortDescription: 'Force no accidentals' },
                        { name: 'Force Natural (forceNatural)', snippet: 'forceNatural', shortDescription: 'Force a naturalize accidental' },
                        { name: 'Force Sharp (forceSharp)', snippet: 'forceSharp', shortDescription: 'Force a sharp accidental' },
                        { name: 'Force Double-Sharp (##)', snippet: '##', shortDescription: 'Force a double-sharp accidental' },
                        { name: 'Force Double-Sharp (forceDoubleSharp)', snippet: 'forceDoubleSharp', shortDescription: 'Force a double-sharp accidental' },
                        { name: 'Force Flat (forceFlat)', snippet: 'forceFlat', shortDescription: 'Force a flat accidental' },
                        { name: 'Force Double-Flat (forceDoubleFlat)', snippet: 'forceDoubleFlat', shortDescription: 'Force a double flat accidental' },
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
