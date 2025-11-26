import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';
import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';

export const accidentals: MetadataTagDefinition = {
    tag: '\\accidentals',
    snippet: '\\accidentals $1 $0',
    shortDescription: 'Changes the mode how accidentals are treated',
    longDescription: `
    Changes the mode how alphaTab should treat accidentals when writing pitched notes.

    alphaTab can use the accidentals as specified in alphaTex, or apply accidentals automatically based on the note pitch.
    `,
    signatures: [
        {
            parameters: [
                {
                    name: 'mode',
                    shortDescription: 'The mode which should be active',
                    parseMode: ValueListParseTypesMode.Required,
                    ...enumParameter('AlphaTexAccidentalMode')
                }
            ]
        }
    ],
    examples: `
        \\accidentals explicit
        C#4 C4 Eb4 Ax4 |
        \\accidentals auto
        C#4 C4 Eb4 Ax4 |
        `
};
