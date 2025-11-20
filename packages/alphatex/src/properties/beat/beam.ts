import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';
import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTex1LanguageDefinitions';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';

export const beam: PropertyDefinition = {
    property: 'beam',
    snippet: 'beam $1$0',
    shortDescription: 'Beams and Stems',
    longDescription: `
    Changes the beaming and stem direction for the beat.
    Can be specified multiple times.
    `,
    signatures: [
        {
            parameters: [
                {
                    name: 'type',
                    shortDescription: 'The mode to apply',
                    parseMode: ValueListParseTypesMode.Required,
                    type: AlphaTexNodeType.Ident,
                    allowAllStringTypes: true,
                    values: [
                        {
                            name: 'invert',
                            snippet: 'invert',
                            shortDescription: 'Inverts the default stem direction.'
                        },
                        { name: 'up', snippet: 'up', shortDescription: 'Forces the stem to point upwards.' },
                        {
                            name: 'down',
                            snippet: 'down',
                            shortDescription: 'Forces the stem to point downwards.'
                        },
                        {
                            name: 'auto',
                            snippet: 'auto',
                            shortDescription: 'Sets the beaming mode to automatic.'
                        },
                        {
                            name: 'split',
                            snippet: 'split',
                            shortDescription: 'Forces a split of the beam to the next beat (if there would be any).'
                        },
                        {
                            name: 'merge',
                            snippet: 'merge',
                            shortDescription:
                                'Forces a merge of the beam to the next beat (even if there would be none).'
                        },
                        {
                            name: 'splitsecondary',
                            snippet: 'splitsecondary',
                            shortDescription: 'Forces a split of the last bar connecting two beats (if there is any).'
                        }
                    ]
                }
            ]
        }
    ],
    examples: `
    :8 3.3{ beam invert } 3.3 |
    3.1{ beam up } 3.1 |
    3.6{ beam down } 3.6 |
    3.3{ beam auto } 3.3 |
    3.3{ beam split } 3.3 |
        3.3 3.3 { beam merge } 3.3 3.3 |
        3.3.16 {beam splitsecondary} 3.3
    `
};
