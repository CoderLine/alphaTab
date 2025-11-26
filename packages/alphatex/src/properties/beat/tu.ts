import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';
import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';

export const tu: PropertyDefinition = {
    property: 'tu',
    snippet: 'tu $1$0',
    shortDescription: 'Tuplet',
    longDescription: `
    Adds a tuplet to the beat duration.

    There are some built-in simple tuplet variants or you can specify the exact division.
    `,
    signatures: [
        {
            parameters: [
                {
                    name: 'simple',
                    shortDescription: 'The simple tuplet',
                    type: AlphaTexNodeType.Number,
                    parseMode: ValueListParseTypesMode.Required,
                    values: [
                        { name: '3', snippet: '3', shortDescription: '3:2 Tuplet' },
                        { name: '5', snippet: '5', shortDescription: '5:4 Tuplet' },
                        { name: '6', snippet: '6', shortDescription: '6:4 Tuplet' },
                        { name: '7', snippet: '7', shortDescription: '7:4 Tuplet' },
                        { name: '9', snippet: '9', shortDescription: '9:8 Tuplet' },
                        { name: '10', snippet: '10', shortDescription: '10:8 Tuplet' },
                        { name: '12', snippet: '12', shortDescription: '12:8 Tuplet' }
                    ]
                }
            ]
        },
        {
            parameters: [
                {
                    name: 'numerator',
                    shortDescription: 'The tuplet numerator',
                    type: AlphaTexNodeType.Number,
                    parseMode: ValueListParseTypesMode.Required
                },
                {
                    name: 'denominator',
                    shortDescription: 'The tuplet denominator',
                    type: AlphaTexNodeType.Number,
                    parseMode: ValueListParseTypesMode.Required
                }
            ]
        }
    ],
    examples: `
        C4 {tu 3} * 3 |
        C4 {tu 5} * 5 |
        C4 {tu 5 2} * 5
        `
};
