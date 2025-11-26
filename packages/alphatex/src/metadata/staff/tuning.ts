import { ArgumentListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const tuning: MetadataTagDefinition = {
    tag: '\\tuning',
    snippet: '\\tuning {$1}$0',
    shortDescription: 'Set the string tuning for the staff.',
    longDescription: `Defines the number of strings and their tuning for stringed (and fretted) instruments.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'mode',
                    shortDescription: 'A built-in standard mode for tunings',
                    parseMode: ArgumentListParseTypesMode.Required,
                    type: AlphaTexNodeType.Ident,
                    allowAllStringTypes: true,
                    values: [
                        {
                            name: 'piano',
                            snippet: 'piano',
                            shortDescription:
                                'Indicates that this staff is NOT stringed, but a piano with pitched notes.'
                        },
                        {
                            name: 'none',
                            snippet: 'none',
                            shortDescription:
                                'Indicates that this staff is NOT stringed and has no tuning and uses pitched notes.'
                        },
                        {
                            name: 'voice',
                            snippet: 'voice',
                            shortDescription:
                                'Indicates that this staff is NOT stringed, but a vocal voice with pitched notes.'
                        }
                    ]
                }
            ]
        },
        {
            parameters: [
                {
                    name: 'strings',
                    shortDescription: 'The tuning values as pitched notes',
                    longDescription: `The tuning values as [pitched notes](https://next.alphatab.net/docs/alphatex/document-structure#pitched-notes)`,
                    type: AlphaTexNodeType.Ident,
                    allowAllStringTypes: true,
                    parseMode: ArgumentListParseTypesMode.ValueListWithoutParenthesis
                }
            ]
        }
    ],
    examples: `
        \\track "Track 1"
          \\staff {tabs}
          \\tuning (A1 D2 A2 D3 G3 B3 E4) { hide label "Special Guitar Tuning" }
          4.1 3.1 2.1 1.1
        \\track "Track 2"
          \\tuning piano
          C4 D4 E4 F4
        `,
    properties: [
        {
            property: 'hide',
            snippet: 'hide',
            shortDescription: 'Hides the tuning from being displayed above the first staff.',
            signatures: [
                {
                    parameters: []
                }
            ],
            examples: `
                \\track
                  \\staff {tabs}
                  \\tuning (E4 B3 G3 D3 A2 D2)
                  4.1 3.1 2.1 1.1   
                \\track
                  \\staff {tabs}
                  \\tuning (F2 C2 G1 D1) { hide}
                  4.1 3.1 2.1 1.1
                `
        },
        {
            property: 'label',
            snippet: 'label "$1"$0',
            shortDescription: 'Defines the textual label for the tuning.',
            signatures: [
                {
                    parameters: [
                        {
                            name: 'text',
                            shortDescription: 'The label to set.',
                            parseMode: ArgumentListParseTypesMode.Required,
                            type: AlphaTexNodeType.String
                        }
                    ]
                }
            ],
            examples: `
                \\track
                  \\staff {tabs}
                  \\tuning (E4 B3 G3 D3 A2 D2) { label "Dropped D Tuning" }
                  4.1 3.1 2.1 1.1
                `
        }
    ]
};
