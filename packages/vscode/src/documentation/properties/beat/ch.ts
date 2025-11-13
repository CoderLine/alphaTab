import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import type { PropertyDoc, ValueItemDoc } from '../../types';

export const ch: PropertyDoc = {
    property: 'ch',
    syntax: ['ch chordName'],
    snippet: 'ch "$1"$0',
    shortDescription: 'Chord',
    longDescription: `
    Adds a chord annotation to the beat.

    If the staff has a definition for this chord it will be shown in the chord diagram list to indicate its usage. The beat still has to define the notes separately.
    `,
    values: [
        {
            name: 'chordName',
            shortDescription: 'The name of the chord',
            type: '`string`',
            required: true,
            values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                [
                    AlphaTexNodeType.Ident,
                    [
                        'PPP',
                        'PP',
                        'P',
                        'MP',
                        'MF',
                        'F',
                        'FF',
                        'FFF',
                        'PPPP',
                        'PPPPP',
                        'PPPPPP',
                        'FFFF',
                        'FFFFF',
                        'FFFFFF',
                        'SF',
                        'SFP',
                        'SFPP',
                        'FP',
                        'RF',
                        'RFZ',
                        'SFZ',
                        'SFFZ',
                        'FZ',
                        'N',
                        'PF',
                        'SFZP'
                    ].map(s => ({ name: s, snippet: s.toLowerCase() }))
                ]
            ])
        }
    ],
    examples: `
        1.1.8{dy ppp} 1.1{dy pp} 1.1{dy p} 1.1{dy mp} 1.1{dy mf} 1.1{dy f} 1.1{dy ff} 1.1{dy fff}
        `
};
