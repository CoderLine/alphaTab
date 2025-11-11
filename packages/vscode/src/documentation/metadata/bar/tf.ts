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
            shortDescription: 'The triplet feel style	',
            type: '`identifier`',
            required: true,
            values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                [
                    AlphaTexNodeType.Ident,
                    [
                        { name: 'No Triplet Feel', snippet: 'none', shortDescription: '' },
                        { name: 'Triplet 16th', snippet: 'triplet16th', shortDescription: '' },
                        { name: 'Triplet 8th', snippet: 'triplet8th', shortDescription: '' },
                        { name: 'Dotted 16th', snippet: 'dotted16th', shortDescription: '' },
                        { name: 'Dotted 8th', snippet: 'dotted8th', shortDescription: '' },
                        { name: 'Scottish 16th', snippet: 'scottish16th', shortDescription: '' },
                        { name: 'Scottish 8th', snippet: 'scottish8th', shortDescription: '' }
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
