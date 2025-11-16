import * as alphaTab from '@coderline/alphatab'; 
import type { MetadataDoc, ValueItemDoc } from '@src/documentation/types';

export const ks: MetadataDoc = {
    tag: '\\ks',
    syntax: ['\\ks key'],
    snippet: '\\ks $1 $0',
    shortDescription: 'Set the key signature',
    longDescription: `Specifies the key signature for this and subsequent bars.`,
    values: [
        {
            name: 'key',
            shortDescription: 'The key signature',
            type: '`identifier`',
            required: true,
            values: new Map<alphaTab.importer.alphaTex.AlphaTexNodeType, ValueItemDoc[]>([
                [
                    alphaTab.importer.alphaTex.AlphaTexNodeType.Ident,
                    [
                        { name: 'Cb', snippet: 'Cb', shortDescription: '' },
                        { name: 'Gb', snippet: 'Gb', shortDescription: '' },
                        { name: 'Db', snippet: 'Db', shortDescription: '' },
                        { name: 'Ab', snippet: 'Ab', shortDescription: '' },
                        { name: 'Eb', snippet: 'Eb', shortDescription: '' },
                        { name: 'Bb', snippet: 'Bb', shortDescription: '' },
                        { name: 'F', snippet: 'F', shortDescription: '' },
                        { name: 'C', snippet: 'C', shortDescription: '' },
                        { name: 'G', snippet: 'G', shortDescription: '' },
                        { name: 'D', snippet: 'D', shortDescription: '' },
                        { name: 'A', snippet: 'A', shortDescription: '' },
                        { name: 'E', snippet: 'E', shortDescription: '' },
                        { name: 'B', snippet: 'B', shortDescription: '' },
                        { name: 'F#', snippet: 'F#', shortDescription: '' },
                        { name: 'C#', snippet: 'C#', shortDescription: '' },

                        { name: 'AbMinor', snippet: 'AbMinor', shortDescription: '' },
                        { name: 'EbMinor', snippet: 'EbMinor', shortDescription: '' },
                        { name: 'BbMinor', snippet: 'BbMinor', shortDescription: '' },
                        { name: 'FMinor', snippet: 'FMinor', shortDescription: '' },
                        { name: 'CMinor', snippet: 'CMinor', shortDescription: '' },
                        { name: 'GMinor', snippet: 'GMinor', shortDescription: '' },
                        { name: 'DMinor', snippet: 'DMinor', shortDescription: '' },
                        { name: 'AMinor', snippet: 'AMinor', shortDescription: '' },
                        { name: 'EMinor', snippet: 'EMinor', shortDescription: '' },
                        { name: 'BMinor', snippet: 'BMinor', shortDescription: '' },
                        { name: 'F#Minor', snippet: 'F#Minor', shortDescription: '' },
                        { name: 'C#Minor', snippet: 'C#Minor', shortDescription: '' },
                        { name: 'G#Minor', snippet: 'G#Minor', shortDescription: '' },
                        { name: 'D#Minor', snippet: 'D#Minor', shortDescription: '' },
                        { name: 'A#Minor', snippet: 'A#Minor', shortDescription: '' },
                    ]
                ]
            ])
        }
    ],
    valueRemarks: `
        For major keys, the value is one of \`Cb\`, \`Gb\`, \`Db\`, \`Ab\`, \`Eb\`, \`Bb\`, \`F\`, \`C\`, \`G\`, \`D\`, \`A\`, \`E\`, \`B\`, \`F#\`, \`C#\`. 
        Their equivalent minor scale can also be used, so \`Bminor\` is the same as \`D\` etc. A major scale can also be explicitly written out, like \`Dmajor\`.
        `,
    examples: `
        \\ks Cb | \\ks C | \\ks C# |
        \\ks Aminor | \\ks Dmajor | \\ks Bminor
        `
};
