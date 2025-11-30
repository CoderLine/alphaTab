import * as alphaTab from '@coderline/alphatab';
import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const balance: PropertyDefinition = {
    property: 'balance',
    snippet: 'balance $1$0',
    shortDescription: 'Balance Change',
    longDescription: `
    Add a balance (pan) change to the beat.

    The change affects all beats after this one.
    `,
    signatures: [
        {
            parameters: [
                {
                    name: 'value',
                    shortDescription: 'The new balance',
                    longDescription: 'The new balance where 0 is left, 16 is right, and 8 is centered.',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Number
                }
            ]
        }
    ],
    examples: `
        C4 {balance 0} D4 E4 {balance 16} F4
        `
};
