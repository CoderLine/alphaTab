import * as alphaTab from '@coderline/alphatab'; 
import type { MetadataDoc, ValueItemDoc } from '@coderline/alphatab-language-server/documentation/types';

export const accidentals: MetadataDoc = {
    tag: '\\accidentals',
    syntax: ['\\accidentals mode'],
    snippet: '\\accidentals $1 $0',
    shortDescription: 'Changes the mode how accidentals are treated',
    longDescription: `
    Changes the mode how alphaTab should treat accidentals when writing pitched notes.

    alphaTab can use the accidentals as specified in alphaTex, or apply accidentals automatically based on the note pitch.
    `,
    values: [
        {
            name: 'mode',
            shortDescription: 'The mode which should be active',
            type: '`identifier`',
            required: true,
            values: new Map<alphaTab.importer.alphaTex.AlphaTexNodeType, ValueItemDoc[]>([
                [
                    alphaTab.importer.alphaTex.AlphaTexNodeType.Ident,
                    [
                        { name: 'auto', snippet: 'auto', shortDescription: '' },
                        { name: 'explicit', snippet: 'explicit', shortDescription: '' }
                    ]
                ]
            ])
        }
    ],
    examples: `
        \\accidentals explicit
        C#4 C4 Eb4 Ax4 |
        \\accidentals auto
        C#4 C4 Eb4 Ax4 |
        `
};
