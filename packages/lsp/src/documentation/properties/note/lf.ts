import * as alphaTab from '@coderline/alphatab';
import type { PropertyDoc, ValueItemDoc } from '@coderline/alphatab-language-server/documentation/types';

export const lf: PropertyDoc = {
    property: 'lf',
    syntax: ['lf finger'],
    snippet: 'lf $1$0',
    shortDescription: 'Left-Hand Finger',
    longDescription: `Adds a left-hand fingering annotation to the note.`,
    values: [
        {
            name: 'finger',
            shortDescription: 'The finger',
            type: '`number`',
            required: false,
            values: new Map<alphaTab.importer.alphaTex.AlphaTexNodeType, ValueItemDoc[]>([
                [
                    alphaTab.importer.alphaTex.AlphaTexNodeType.Number,
                    [
                        { name: '1', snippet: '1', shortDescription: 'Thumb' },
                        { name: '2', snippet: '2', shortDescription: 'Index-Finger' },
                        { name: '3', snippet: '3', shortDescription: 'Middle-Finger' },
                        { name: '4', snippet: '4', shortDescription: 'Annual-Finger' },
                        { name: '5', snippet: '5', shortDescription: 'Little-Finger' }
                    ]
                ]
            ])
        }
    ],
    examples: `
        :8 3.3{lf 1} 3.3{lf 2} 3.3{lf 3} 3.3{lf 4} 3.3{lf 5} (2.2{lf 4} 2.3{lf 3} 2.4{lf 2}) |
        :8 3.3{rf 1} 3.3{rf 2} 3.3{rf 3} 3.3{rf 4} 3.3{lf 5}
        `
};
