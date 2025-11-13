import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import type { PropertyDoc, ValueItemDoc } from '../../types';

export const beam: PropertyDoc = {
    property: 'beam',
    syntax: ['beam mode'],
    snippet: 'beam $1$0',
    shortDescription: 'Beams and Stems',
    longDescription: `
    Changes the beaming and stem direction for the beat.
    Can be specified multiple times.
    `,
    values: [
        {
            name: 'type',
            shortDescription: 'The mode to apply',
            type: '`identifier`',
            required: true,
            values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                [AlphaTexNodeType.Ident,
                    [
                        { name: "Invert Stem", snippet: "invert", shortDescription: "Inverts the default stem direction." },
                        { name: "Stem Upwards", snippet: "up", shortDescription: "Forces the stem to point upwards." },
                        { name: "Stem Downwards", snippet: "down", shortDescription: "Forces the stem to point downwards." },
                        { name: "Stem Automatic", snippet: "auto", shortDescription: "Sets the beaming mode to automatic." },
                        { name: "Beam Split", snippet: "split", shortDescription: "Forces a split of the beam to the next beat (if there would be any)." },
                        { name: "Beam Merge", snippet: "merge", shortDescription: "Forces a merge of the beam to the next beat (even if there would be none)." },
                        { name: "Beam Split Secondary", snippet: "splitsecondary ", shortDescription: "Forces a split of the last bar connecting two beats (if there is any)." },
                    ]
                ]
            ])
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
