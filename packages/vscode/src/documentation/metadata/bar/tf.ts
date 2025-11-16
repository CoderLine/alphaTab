import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import type { MetadataDoc, ValueItemDoc } from '../../types';

export const tf: MetadataDoc = {
    tag: '\\tf',
    syntax: ['\\tf tripletFeel'],
    snippet: '\\tf $1 $0',
    shortDescription: 'Set the triplet feel (swing)',
    longDescription: `Changes the triplet feel (aka. swing) play style.`,
    values: [
        {
            name: 'tripletFeel',
            shortDescription: 'The triplet feel style',
            type: '`identifier`',
            required: true,
            values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                [
                    AlphaTexNodeType.Ident,
                    [
                        { name: 'none', snippet: 'none', shortDescription: 'No Triplet Feel' },
                        { name: 'triplet16th', snippet: 'triplet16th', shortDescription: 'Triplet 16th' },
                        { name: 'triplet8th', snippet: 'triplet8th', shortDescription: 'Triplet 8th' },
                        { name: 'dotted16th', snippet: 'dotted16th', shortDescription: 'Dotted 16th' },
                        { name: 'dotted8th', snippet: 'dotted8th', shortDescription: 'Dotted 8th' },
                        { name: 'scottish16th', snippet: 'scottish16th', shortDescription: 'Scottish 16th' },
                        { name: 'scottish8th', snippet: 'scottish8th', shortDescription: 'Scottish 8th' }
                    ]
                ]
            ])
        }
    ],
    examples: `
        \\tf none 3.3*4 |
        \\tf triplet16th 3.3*4 | \\tf triplet8th 3.3*4 |
        \\tf dotted16th 3.3*4 | \\tf dotted8th 3.3*4 |
        \\tf scottish16th 3.3*4 | \\tf scottish8th 3.3*4 |
        `
};
