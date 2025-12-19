import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const hideEmptyStavesInFirstSystem: MetadataTagDefinition = {
    tag: '\\hideEmptyStavesInFirstSystem',
    snippet: '\\hideEmptyStavesInFirstSystem',
    shortDescription: `Hide empty staves in first system.`,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: {
        options: { display: {systemsLayoutMode: 'UseModelLayout'}},
        tex: `
        \\hideEmptyStaves
        \\hideEmptyStavesInFirstSystem
        \\defaultSystemsLayout 3
        \\track "Track 1"
            C4 * 4 | C4 * 4 | C4 * 4 | 
            r | r | r | 
        \\track "Track 2"
            r | r | r |
            r | C4.1 | r |
        `
    }
}
