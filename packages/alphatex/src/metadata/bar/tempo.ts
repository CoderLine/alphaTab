import * as alphaTab from '@coderline/alphatab';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

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
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Number,
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.RequiredAsFloat
                },
                {
                    name: 'label',
                    shortDescription: 'A textual label for the tempo',
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.String,
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Optional,
                    defaultValue: '""'
                }
            ]
        },
        {
            strict: true,
            parameters: [
                {
                    name: 'tempo',
                    shortDescription: 'The new tempo in BPM',
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Number,
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.RequiredAsFloat
                },
                {
                    name: 'label',
                    shortDescription: 'A textual label for the tempo',
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.String,
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    defaultValue: '""'
                },
                {
                    name: 'position',
                    shortDescription: 'A relative (ratio) position where within the bar the tempo change should happen',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Optional,
                    defaultValue: '0',
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Number
                },
                {
                    name: 'hide',
                    shortDescription: 'If specified the tempo change is not visually shown',
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Ident,
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Optional,
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
