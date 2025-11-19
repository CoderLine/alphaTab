import * as alphaTab from '@coderline/alphatab'; 
import type { MetadataDoc, ValueItemDoc } from '@coderline/alphatab-language-server/documentation/types';

export const clef: MetadataDoc = {
    tag: '\\clef',
    syntax: ['\\clef clef'],
    snippet: '\\clef $1 $0',
    shortDescription: 'Set the clef.',
    longDescription: `Changes the clef for this and subsequent bars.`,
    values: [
        {
            name: 'clef',
            shortDescription: 'The clef',
            type: '`identifier`',
            required: true,
            values: new Map<alphaTab.importer.alphaTex.AlphaTexNodeType, ValueItemDoc[]>([
                [
                    alphaTab.importer.alphaTex.AlphaTexNodeType.Ident,
                    [
                        { name: 'G2', snippet: 'G2', shortDescription: '' },
                        { name: 'F4', snippet: 'F4', shortDescription: '' },
                        { name: 'C3', snippet: 'C3', shortDescription: '' },
                        { name: 'C4', snippet: 'C4', shortDescription: '' },
                        { name: 'N', snippet: 'N', shortDescription: '' },
                        { name: 'Treble', snippet: 'Treble', shortDescription: '' },
                        { name: 'Bass', snippet: 'Bass', shortDescription: '' },
                        { name: 'Tenor', snippet: 'Tenor', shortDescription: '' },
                        { name: 'Alto', snippet: 'Alto', shortDescription: '' },
                        { name: 'Neutral', snippet: 'Neutral', shortDescription: '' },
                    ]
                ]
            ])
        }
    ],
    examples: `
        \\clef G2 | \\clef F4 | \\clef C3 | \\clef C4 | \\clef N |
        \\clef Treble | \\clef Bass | \\clef Tenor | \\clef Alto | \\clef Neutral |
        `
};
