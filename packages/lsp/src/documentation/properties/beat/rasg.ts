import * as alphaTab from '@coderline/alphatab';
import type { PropertyDoc, ValueItemDoc } from '@coderline/alphatab-lsp/documentation/types';

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
            values: new Map<alphaTab.importer.alphaTex.AlphaTexNodeType, ValueItemDoc[]>([
                [
                    alphaTab.importer.alphaTex.AlphaTexNodeType.Ident,
                    [
                        { name: 'ii', snippet: 'ii', shortDescription: 'ii' },
                        { name: 'mi', snippet: 'mi', shortDescription: 'mi' },
                        { name: 'miiTriplet', snippet: 'miiTriplet', shortDescription: 'mii (triplet)' },
                        { name: 'miiAnapaest', snippet: 'miiAnapaest', shortDescription: 'mii (anapaest)' },
                        { name: 'pmpTriplet', snippet: 'pmpTriplet', shortDescription: 'pmp (triplet)' },
                        { name: 'pmpAnapaest', snippet: 'pmpAnapaest', shortDescription: 'pmp (anapaest)' },
                        { name: 'peiTriplet', snippet: 'peiTriplet', shortDescription: 'pei (triplet)' },
                        { name: 'peiAnapaest', snippet: 'peiAnapaest', shortDescription: 'pei (anapaest)' },
                        { name: 'paiTriplet', snippet: 'paiTriplet', shortDescription: 'pai (triplet)' },
                        { name: 'paiAnapaest', snippet: 'paiAnapaest', shortDescription: 'pai (anapaest)' },
                        { name: 'amiTriplet', snippet: 'amiTriplet', shortDescription: 'ami (triplet)' },
                        { name: 'amiAnapaest', snippet: 'amiAnapaest', shortDescription: 'ami (anapaest)' },
                        { name: 'ppp', snippet: 'ppp', shortDescription: 'ppp' },
                        { name: 'amii', snippet: 'amii', shortDescription: 'amii' },
                        { name: 'amip', snippet: 'amip', shortDescription: 'amip' },
                        { name: 'eami', snippet: 'eami', shortDescription: 'eami' },
                        { name: 'eamii', snippet: 'eamii', shortDescription: 'eamii' },
                        { name: 'peami', snippet: 'peami', shortDescription: 'peami' }
                    ]
                ]
            ])
        }
    ],
    examples: `
        (1.1 3.2 2.3 0.4) * 4 {rasg amii}
        `
};
