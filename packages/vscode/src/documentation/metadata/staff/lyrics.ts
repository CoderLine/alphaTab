import type { MetadataDoc } from '../../types';

export const lyrics: MetadataDoc = {
    tag: '\\lyrics',
    syntax: ['\\lyrics startBar', '\\lyrics lyrics'],
    snippet: '\\lyrics "{$1}"$0',
    shortDescription: 'Set the lyrics shown for the current staff.',
    longDescription: `
    Define the lyrics shown on the beats of the staff.

    The lyrics system of alphaTab is borrowed from Guitar Pro. For every track multiple "lines" of lyrics can be defined which can either start at the beginning or at a later bar. The syllables of the provided lyrics are spread automatically across the beats of the track. Syllables are separated with spaces. If multiple words/syllables should stay on the same beat the space can be replaced with a \`+\`. Comments which should not be displayed can be put \`[into brackets]\`.
    `,
    values: [
        {
            name: 'startBar',
            shortDescription: 'The first bar on which the notes should be applied',
            type: '`number`',
            required: false
        },
        {
            name: 'lyrics',
            shortDescription: 'The lyrics text to apply to the beats	',
            type: '`string`',
            required: true
        }
    ],
    examples: [
        `
        \\title "With Lyrics"
        \\instrument piano
        \\lyrics "Do Re Mi Fa So La Ti"
        C4 D4 E4 F4 | G4 A4 B4 r
        `,
        `
        \\title "Combine Syllables (and empty beats)"
        \\instrument piano
        \\lyrics "Do+Do  Mi+Mi"
        C4 C4 E4 E4
        `,
        `
        \\title "Start Later"
        \\instrument piano
        \\lyrics 2 "Do Re Mi Fa So La Ti"
        r r r r | r r r r |
        C4 D4 E4 F4 | G4 A4 B4 r
        `,
        `
        \\title "Comment"
        \\subtitle "Useful when loading lyrics from a different source"
        \\instrument piano
        \\lyrics "[This is a comment]Do Re Mi Fa"
        C4 D4 E4 F4        
        `
    ]
};
