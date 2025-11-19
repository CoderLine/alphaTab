import type { MetadataDoc } from '@coderline/alphatab-language-server/documentation/types';

export const ac: MetadataDoc = {
    tag: '\\ac',
    syntax: ['\\ac'],
    snippet: '\\ac $0',
    shortDescription: 'Mark an anacrusis (pick-up) bar',
    longDescription:
    `
    Marks the bar as an anacrusis (pick-up) bar.

    By default bars follow a strict timing defined by the time signature and tempo. Anacrusis (aka. pickup bars) do not follow this rule. The length of those bars is defined by the actual beats/notes in the bar.
    `,
    values: [],
    examples: `
        \\ks D \\ts 24 16 \\ac r.16 6.3 7.3 9.3 7.3 6.3 | r.16 5.4 7.4 9.4 7.4 5.4 6.3.4{d} 9.6.16 10.6 12.6 10.6 9.6 14.6.4{d} r.16
        `
};
