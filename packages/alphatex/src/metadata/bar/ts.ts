import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';
import { ArgumentListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';

export const ts: MetadataTagDefinition = {
    tag: '\\ts',
    snippet: '\\ts ($1 $2) $0',
    shortDescription: 'Set the time signature',
    longDescription: `
    Defines the time signature for this and subsequent bars.

    AlphaTab does not yet support polytempo notation where instruments might use different time signatures. Therefore be sure to only specify the timesignatures once as part of the first track/staff or ensure they are consistent across the whole document.
    `,
    signatures: [
        {
            description: 'Specifies a common (4/4) time signature using the special C symbol',
            parameters: [
                {
                    name: 'common',
                    shortDescription: '',
                    type: AlphaTexNodeType.Ident,
                    parseMode: ArgumentListParseTypesMode.Required,
                    values: [
                        {
                            name: 'common',
                            shortDescription: 'Specifies a common (4/4) time signature using the special C symbol',
                            snippet: 'common'
                        }
                    ]
                }
            ]
        },
        {
            parameters: [
                {
                    name: 'numerator',
                    shortDescription: 'The time signature numerator',
                    parseMode: ArgumentListParseTypesMode.Required,
                    type: AlphaTexNodeType.Number
                },
                {
                    name: 'numerator',
                    shortDescription: 'The time signature denominator',
                    parseMode: ArgumentListParseTypesMode.Required,
                    type: AlphaTexNodeType.Number
                }
            ]
        }
    ],

    examples: `
        \\ts 3 4 | \\ts 4 4 | \\ts 6 8 | \\ts common
        `
};
