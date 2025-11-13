import { AlphaTexNodeType } from '@src/importer/alphaTex/AlphaTexAst';
import type { PropertyDoc, ValueItemDoc } from '../../types';

export const fermata: PropertyDoc = {
    property: 'fermata',
    syntax: ['fermata type', 'fermata (type length)'],
    snippet: 'fermata $1$0',
    shortDescription: 'Fermata',
    longDescription: `Adds a fermata to the beat.`,
    values: [
        {
            name: 'type',
            shortDescription: 'The fermata type',
            type: '`identifier`',
            required: true,
            values: new Map<AlphaTexNodeType, ValueItemDoc[]>([
                [AlphaTexNodeType.Ident, ['Short', 'Medium', 'Long'].map(s => ({ name: s, snippet: s.toLowerCase() }))]
            ])
        },
        {
            name: 'length',
            shortDescription: 'The fermata length',
            type: '`number`',
            required: false
        }
    ],
    examples: `
        G4 G4 G4 { fermata medium 4 }
        `
};
