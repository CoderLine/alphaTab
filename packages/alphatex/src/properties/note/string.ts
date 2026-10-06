import * as alphaTab from '@coderline/alphatab';
import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const string: PropertyDefinition = {
    property: 'string',
    snippet: 'string',
    shortDescription: 'Show String Number',
    longDescription: `
    Adds an annotation showing the string number of the note above the staff.

    For fretted notes the string is taken from the note value (\`fret.string\`).
    For pitched notes the string number can be specified explicitly (e.g. string indications in classical guitar music).
    It is only shown as annotation and has no effect on the playback.
    `,
    signatures: [
        {
            description: 'Show the string number of a fretted note',
            parameters: []
        },
        {
            description: 'Show the given string number on a pitched note',
            parameters: [
                {
                    name: 'string',
                    shortDescription: 'The string number (1 is the highest string)',
                    longDescription:
                        'The string number to show. Like for fretted notes 1 is the highest string. On staves without tuning a standard 6 string instrument is assumed. Only allowed on pitched notes.',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Number
                }
            ]
        }
    ],
    examples: [
        `
        3.3{string} 3.4{string} 3.5{string}
        `,
        `
        \\tuning piano
        .
        a4{string 1} c4{string 2} g3{string 3} e3{string 4}
        `
    ]
};
