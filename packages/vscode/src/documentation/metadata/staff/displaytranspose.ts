import type { MetadataDoc } from '../../types';

export const displayTranspose: MetadataDoc = {
    tag: '\\displayTranspose',
    syntax: ['\\displayTranspose semitones'],
    snippet: '\\displayTranspose {$1}$0',
    shortDescription: 'Set the transpose for the standard notation display.',
    longDescription: `
    Defines the number of semitones by which the standard notation should be transposed.

    This only affects the display of the notes, not their audio.

    It is typically used in situations like for guitars where the standard notation is displayed 1 octave lower to fit better into the standard staff.

    It is a common practice to show a standard clef on guitar notes even though they are transposed by 1 octave to better fit into the standard staff lines.
    `,
    values: [
        {
            name: 'semitones',
            shortDescription: 'The number of semitones by which the notes should be transposed',
            type: 'number',
            required: true
        }
    ],
    examples: `
        \\track \\staff \\instrument piano
        \\displayTranspose -12
            C4.4 D4 E4 F4 | r.1
        `
};
