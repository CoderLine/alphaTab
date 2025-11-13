import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import type { PropertyDoc, ValueItemDoc } from '../../types';

export const rf: PropertyDoc = {
    property: 'rf',
    syntax: ['rf finger'],
    snippet: 'rf $1$0',
    shortDescription: 'Right-Hand Finger',
    longDescription: `Adds a right-hand fingering annotation to the note.`,
    values: [
        {
            name: 'finger',
            shortDescription: 'The finger',
            type: '`number`',
            required: false,
            values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                [
                    AlphaTexNodeType.Number,
                    [
                        { name: 'Thumb', snippet: '1', shortDescription: '' },
                        { name: 'Index-Finger', snippet: '2', shortDescription: '' },
                        { name: 'Middle-Finger', snippet: '3', shortDescription: '' },
                        { name: 'Annual-Finger', snippet: '4', shortDescription: '' },
                        { name: 'Little-Finger', snippet: '5', shortDescription: '' }
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
