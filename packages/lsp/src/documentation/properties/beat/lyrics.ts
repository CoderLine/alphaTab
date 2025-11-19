import type { PropertyDoc } from '@coderline/alphatab-language-server/documentation/types';

export const beatLyrics: PropertyDoc = {
    property: 'lyrics',
    syntax: ['lyrics text', 'lyrics line text'],
    snippet: 'lyrics "$1"$0',
    shortDescription: 'Lyrics',
    longDescription: `
    Adds a lyric text to the beat.

    This is an alternative way of applying the exact lyrics to beats instead of using the \`\\lyrics\` metadata where a special syntax is used to spread the text across beats.
    `,
    values: [
        {
            name: 'text',
            shortDescription: 'The lyrics to show',
            type: '`string`',
            required: true
        },
        {
            name: 'line',
            shortDescription: 'The line number (e.g. for multiple verses)',
            type: '`number`',
            required: false
        }
    ],
    examples: `
        C4 {lyrics "Do"} 
        D4 {lyrics "Re"} 
        E4 {lyrics "Mi"} 
        F4 {lyrics "Fa"} |
        G4 {lyrics 0 "So" lyrics 1 "G"}
        A4 {lyrics 0 "La" lyrics 1 "A"}
        B4 {lyrics 0 "Ti" lyrics 1 "B"}
        r
        `
};
