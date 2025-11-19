import * as alphaTab from '@coderline/alphatab';
import type { PropertyDoc, ValueItemDoc } from '@coderline/alphatab-language-server/documentation/types';

export const tu: PropertyDoc = {
    property: 'tu',
    syntax: ['tu simple', 'tu (numerator denominator)'],
    snippet: 'tu $1$0',
    shortDescription: 'Tuplet',
    longDescription: `
    Adds a tuplet to the beat duration.

    There are some built-in simple tuplet variants or you can specify the exact division.
    `,
    values: [
        {
            name: 'simple',
            shortDescription: 'The simple tuplet',
            type: '`number`',
            required: true,
            values: new Map<alphaTab.importer.alphaTex.AlphaTexNodeType, ValueItemDoc[]>([
                [
                    alphaTab.importer.alphaTex.AlphaTexNodeType.Number,
                    [
                        { name: '3', snippet: '3', shortDescription: '3:2 Tuplet' },
                        { name: '5', snippet: '5', shortDescription: '5:4 Tuplet' },
                        { name: '6', snippet: '6', shortDescription: '6:4 Tuplet' },
                        { name: '7', snippet: '7', shortDescription: '7:4 Tuplet' },
                        { name: '9', snippet: '9', shortDescription: '9:8 Tuplet' },
                        { name: '10', snippet: '10', shortDescription: '10:8 Tuplet' },
                        { name: '12', snippet: '12', shortDescription: '12:8 Tuplet' }
                    ]
                ]
            ])
        },
        {
            name: 'numerator',
            shortDescription: 'The tuplet numerator',
            type: '`number`',
            required: true
        },
        {
            name: 'denominator',
            shortDescription: 'The tuplet denominator',
            type: '`number`',
            required: true
        }
    ],
    examples: `
        C4 {tu 3} * 3 |
        C4 {tu 5} * 5 |
        C4 {tu 5 2} * 5
        `
};
