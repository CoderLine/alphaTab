import type { MetadataDoc } from '@src/documentation/types';

export const useSystemSignSeparator: MetadataDoc = {
    tag: '\\useSystemSignSeparator',
    syntax: ['\\useSystemSignSeparator'],
    snippet: '\\useSystemSignSeparator',
    shortDescription: 'Show the system separator when rendering multiple tracks',
    longDescription: `Configures whether a system sign separator should be added (in case multiple tracks are shown).`,
    values: [],
    examples: `
        \\useSystemSignSeparator
        \\defaultSystemsLayout 2
        \\track "T1"
        :1 C4 | C4 | C4
        \\track "T2"
        :1 C4 | C4 | C4
        `
};
