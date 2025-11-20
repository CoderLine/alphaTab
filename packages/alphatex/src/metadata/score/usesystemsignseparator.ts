import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const useSystemSignSeparator: MetadataTagDefinition = {
    tag: '\\useSystemSignSeparator',
    snippet: '\\useSystemSignSeparator',
    shortDescription: 'Show the system separator when rendering multiple tracks',
    longDescription: `Configures whether a system sign separator should be added (in case multiple tracks are shown).`,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        \\useSystemSignSeparator
        \\defaultSystemsLayout 2
        \\track "T1"
        :1 C4 | C4 | C4
        \\track "T2"
        :1 C4 | C4 | C4
        `
};
