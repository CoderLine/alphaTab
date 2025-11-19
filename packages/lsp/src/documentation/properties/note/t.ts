import type { PropertyDoc } from '@coderline/alphatab-language-server/documentation/types';

export const t: PropertyDoc = {
    property: 't',
    syntax: ['t'],
    snippet: 't',
    shortDescription: 'Tied-Note',
    longDescription: `
    Marks the note as a tied note.
    
    This is an alternative syntax to directly specifying the fret as \`-\`.

    For non stringed instrument it can be a bit more tricky as we cannot use the string to identify which note to tie. There are multiple ways to work around this problem. AlphaTab will try to find the start note for the tie via several rules, if this does not match the desired behavior, you can specify the note value as alternative and indicate the tie via a note effect.
    `,
    values: [],
    examples: [
        `
        3.3 -.3 | (1.1 3.2 2.3 0.4) (-.1 -.4)
        `,
        `
        \\tuning piano
        .
        // If there is a single note on the previous beat, we tie to this one
        // Then a simple - is enough for a tie
        :2 a4 - |
        // Alternatively you can specify a '-' or 't' as note effect to indicate a tie
        :2 a4 a4{-} |
        :2 a4 a4{t} |
        // This also works for chords using correct note ordering
        :2 (a4 a3) (- a3) |
        :2 (a4 a3) (a4 -) |
        // If nothing helps, always the explicit note value and tie effect should allow
        // specifying the correct behavior
        :2 (a4 a3) (a4{t} a3) |
        :4 (a4 a3) (b2 b3) a4{t} a3{-} |
        `
    ]
};
