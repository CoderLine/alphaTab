import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';
import { ArgumentListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';

export const tempo: MetadataTagDefinition = {
    tag: '\\tempo',
    snippet: '\\tempo $1 $0',
    shortDescription: 'Add a tempo change to the bar.',
    longDescription: `
        Adds a tempo change to the bar.

        A bar can have multiple tempo changes. They can either be relatively positioned using this metadata tag or applied via the \`tempo\` property as beat effect.

        Tempo changes affect the whole song and not only an individual track. To avoid unexpected side effects, we recomment to specify the tempo changes only once on the first track/staff.
    `,
    signatures: [
        {
            parameters: [
                {
                    name: 'tempo',
                    shortDescription: 'The new tempo in BPM',
                    type: AlphaTexNodeType.Number,
                    parseMode: ArgumentListParseTypesMode.RequiredAsFloat
                },
                {
                    name: 'label',
                    shortDescription: 'A textual label for the tempo',
                    type: AlphaTexNodeType.String,
                    parseMode: ArgumentListParseTypesMode.Optional,
                    defaultValue: '""'
                },
                {
                    name: 'position',
                    shortDescription: 'A relative (ratio) position where within the bar the tempo change should happen',
                    parseMode: ArgumentListParseTypesMode.OptionalAsFloat,
                    defaultValue: '0',
                    type: AlphaTexNodeType.Number
                },
                {
                    name: 'hide',
                    shortDescription: 'If specified the tempo change is not visually shown',
                    type: AlphaTexNodeType.Ident,
                    parseMode: ArgumentListParseTypesMode.Optional,
                    values: [
                        {
                            name: 'hide',
                            shortDescription: 'If specified the tempo change is not visually shown',
                            snippet: 'hide'
                        }
                    ]
                }
            ]
        }
    ],
    examples: `
        \\tempo 30
        C4 D4 E4 F4 |
        \\tempo (120 "Moderate")
        \\tempo (60 "" 0.5 hide)
        C4 D4 E4 F4 |
        `
};
