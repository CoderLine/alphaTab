import type { MetadataDoc } from '@src/documentation/types';

export const transpose: MetadataDoc = {
    tag: '\\transpose',
    syntax: ['\\transpose semitones'],
    snippet: '\\transpose {$1}$0',
    shortDescription: 'Set the transpose for the standard notation.',
    longDescription: `
    Defines the number of semitones by which the standard notation should be transposed.

    This affects the display and audio.
    `,
    values: [
        {
            name: 'semitones',
            shortDescription: 'The number of semitones by which the notes should be transposed',
            type: '`number`',
            required: true
        }
    ],
    examples: `
        \\track \\staff \\instrument piano
        \\transpose -12
            C4.4 D4 E4 F4 | r.1
        `
};
