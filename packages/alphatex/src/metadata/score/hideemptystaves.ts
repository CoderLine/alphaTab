import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const hideEmptyStaves: MetadataTagDefinition = {
    tag: '\\hideEmptyStaves',
    snippet: '\\hideEmptyStaves',
    shortDescription: `Hide empty staves.`,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: {
        options: { display: {systemsLayoutMode: 'UseModelLayout'}},
        tex: `
        \\hideEmptyStaves
        \\defaultSystemsLayout 3
        \\track "Track 1"
            C4 * 4 | C4 * 4 | C4 * 4 | 
            C4 * 4 | C4 * 4 | C4 * 4 | 
        \\track "Track 2"
            r | r | r |
            r | C4.1 | r |
        `
    }
}
