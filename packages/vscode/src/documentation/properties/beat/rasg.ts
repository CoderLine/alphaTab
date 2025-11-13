import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import type { PropertyDoc, ValueItemDoc } from '../../types';

export const rasg: PropertyDoc = {
    property: 'rasg',
    syntax: ['rasg pattern'],
    snippet: 'rags $1$0',
    shortDescription: 'Rasgueado',
    longDescription: `Add a rasgueado play pattern to the beat.`,
    values: [
        {
            name: 'pattern',
            shortDescription: 'The pattern to apply',
            type: '`identifier`',
            required: true,
            values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                [
                    AlphaTexNodeType.Ident,
                    [
                        { name: 'ii', snippet: 'ii' },
                        { name: 'mi', snippet: 'mi' },
                        { name: 'mii (triplet)', snippet: 'miiTriplet' },
                        { name: 'mii (anapaest)', snippet: 'miiAnapaest' },
                        { name: 'pmp (triplet)', snippet: 'pmpTriplet' },
                        { name: 'pmp (anapaest)', snippet: 'pmpAnapaest' },
                        { name: 'pei (triplet)', snippet: 'peiTriplet' },
                        { name: 'pei (anapaest)', snippet: 'peiAnapaest' },
                        { name: 'pai (triplet)', snippet: 'paiTriplet' },
                        { name: 'pai (anapaest)', snippet: 'paiAnapaest' },
                        { name: 'ami (triplet)', snippet: 'amiTriplet' },
                        { name: 'ami (anapaest)', snippet: 'amiAnapaest' },
                        { name: 'ppp', snippet: 'ppp' },
                        { name: 'amii', snippet: 'amii' },
                        { name: 'amip', snippet: 'amip' },
                        { name: 'eami', snippet: 'eami' },
                        { name: 'eamii', snippet: 'eamii' },
                        { name: 'peami', snippet: 'peami' }
                    ]
                ]
            ])
        }
    ],
    examples: `
        (1.1 3.2 2.3 0.4) * 4 {rasg amii}
        `
};
