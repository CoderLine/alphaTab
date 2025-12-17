import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const showSingleStaffBrackets: MetadataTagDefinition = {
    tag: '\\showSingleStaffBrackets',
    snippet: '\\showSingleStaffBrackets',
    shortDescription: `Show brackets and braces on single staves.`,
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
        \\showSingleStaffBrackets
        \\defaultSystemsLayout 3
        \\track "Track 1"
            \\staff { score }
            C4 * 4 | C4 * 4 | C4 * 4 |
            C4 * 4 | C4 * 4 | C4 * 4 |
            \\staff { score }
            r | r | r | 
            r | C4.1 | r | 
        `
    }
}
