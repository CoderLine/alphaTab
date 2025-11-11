import { type MetadataDoc, properties } from '../../types';

export const staff: MetadataDoc = {
    tag: '\\staff',
    syntax: ['\\staff'],
    snippet: '\\staff {$1}$0',
    shortDescription: 'Start a new staff',
    longDescription: `Marks the start of a new staff.
    
    The staff with the largest number of bars defines how long the overall song is. There is no need to manually ensure that all staves have the correct number of bars. AlphaTab will create missing empty bars automatically.
    
    If no properties describing the visible notation are provided, the default is \`score tabs\`.
    `,
    values: [],
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
    properties: properties(
        {
            property: 'score',
            syntax: ['score lineCount'],
            snippet: 'score $0',
            shortDescription: 'Enable the display of standard notation.',
            values: [
                {
                    name: 'lineCount',
                    shortDescription: 'The number of staff lines',
                    type: 'string',
                    required: true,
                    defaultValue: '5'
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
            syntax: ['tabs'],
            snippet: 'tabs $0',
            shortDescription: 'Enable the display of guitar tablature.',
            longDescription: `
                Enable the display of guitar tablature.

                Guitar tabs are only shown if the contained notes are stringed/fretted notes.
                `,
            values: [
            ],
            examples: `
                \\track
                    \\staff {tabs}
                    3.3 4.3 5.3 5.5
                `
        },
        {
            property: 'slash',
            syntax: ['slash'],
            snippet: 'slash $0',
            shortDescription: `Enable the display of slash notation.`,
            values: [
            ],
            examples: `
                \\track
                    \\staff {tabs slash}
                    3.3 4.3 5.3 5.5
                `
        },
        {
            property: 'numbered',
            syntax: ['numbered'],
            snippet: 'numbered $0',
            shortDescription: `Enable the display of numbered notation (Jianpu).`,
            values: [
            ],
            examples: `
                \\track
                    \\staff {score numbered}
                    C4 D4 E4 F4
                `
        }
    )
};
