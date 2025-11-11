import type { MetadataDoc } from '../types';

export const useSystemSignSeparator: MetadataDoc = {
    tag: '\\useSystemSignSeparator',
    syntax: ['\\useSystemSignSeparator'],
    snippet: '\\useSystemSignSeparator',
    description: `Configures whether a system sign separator should be added (in case multiple tracks are shown).`,
    values: [],
    example: `
        \\useSystemSignSeparator
        \\defaultSystemsLayout 2
        \\track "T1"
        :1 C4 | C4 | C4
        \\track "T2"
        :1 C4 | C4 | C4
        `
};
