import * as alphaTab from '@coderline/alphatab';
import type { PropertyDoc, ValueItemDoc } from '@coderline/alphatab-lsp/documentation/types';

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
            values: new Map<alphaTab.importer.alphaTex.AlphaTexNodeType, ValueItemDoc[]>([
                [alphaTab.importer.alphaTex.AlphaTexNodeType.Ident, ['Short', 'Medium', 'Long'].map(s => ({ name: s, snippet: s.toLowerCase(), shortDescription: '' }))]
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
