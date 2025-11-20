import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTex1LanguageDefinitions';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const staff: MetadataTagDefinition = {
    tag: '\\staff',
    snippet: '\\staff {$1}$0',
    shortDescription: 'Start a new staff',
    longDescription: `Marks the start of a new staff.
    
    The staff with the largest number of bars defines how long the overall song is. There is no need to manually ensure that all staves have the correct number of bars. AlphaTab will create missing empty bars automatically.
    
    If no properties describing the visible notation are provided, the default is \`score tabs\`.
    `,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        \\track "Piano with Grand Staff" "pno."
          \\staff{score} \\tuning piano \\instrument acousticgrandpiano
          c4 d4 e4 f4 |
          \\staff{score} \\tuning piano \\clef F4
          c2 c2 c2 c2 |
        \\track "Guitar"
          \\staff{tabs slash} \\capo 5
          1.2 3.2 0.1 1.1
        `,
    properties: [
        {
            property: 'score',
            snippet: 'score $0',
            shortDescription: 'Enable the display of standard notation.',
            signatures: [
                {
                    parameters: [
                        {
                            name: 'lineCount',
                            shortDescription: 'The number of staff lines',
                            parseMode: ValueListParseTypesMode.Optional,
                            type: AlphaTexNodeType.Number,
                            defaultValue: 5
                        }
                    ]
                }
            ],
            examples: `
                \\track
                    \\staff {score 3}
                    D4 D4 D4 D4
                    \\staff {score}
                    C4 C4 C4 C4
                `
        },
        {
            property: 'tabs',
            snippet: 'tabs $0',
            shortDescription: 'Enable the display of guitar tablature.',
            longDescription: `
                Enable the display of guitar tablature.

                Guitar tabs are only shown if the contained notes are stringed/fretted notes.
                `,
            signatures: [
                {
                    parameters: []
                }
            ],
            examples: `
                \\track
                    \\staff {tabs}
                    3.3 4.3 5.3 5.5
                `
        },
        {
            property: 'slash',
            snippet: 'slash $0',
            shortDescription: `Enable the display of slash notation.`,
            signatures: [
                {
                    parameters: []
                }
            ],
            examples: `
                \\track
                    \\staff {tabs slash}
                    3.3 4.3 5.3 5.5
                `
        },
        {
            property: 'numbered',
            snippet: 'numbered $0',
            shortDescription: `Enable the display of numbered notation (Jianpu).`,
            signatures: [
                {
                    parameters: []
                }
            ],
            examples: `
                \\track
                    \\staff {score numbered}
                    C4 D4 E4 F4
                `
        }
    ]
};
