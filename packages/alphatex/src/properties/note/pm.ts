import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const pm: PropertyDefinition = {
    property: 'pm',
    snippet: 'pm',
    shortDescription: 'Palm-Mute',
    longDescription: `Applies a palm mute effect to the note.`,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        3.3{pm} 3.3{pm} 3.3{pm} 3.3{pm}
        `
};
