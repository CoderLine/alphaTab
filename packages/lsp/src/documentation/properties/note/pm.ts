import type { PropertyDoc } from '@coderline/alphatab-lsp/documentation/types';

export const pm: PropertyDoc = {
    property: 'pm',
    syntax: ['pm'],
    snippet: 'pm',
    shortDescription: 'Palm-Mute',
    longDescription: `Applies a palm mute effect to the note.`,
    values: [],
    examples: 
        `
        3.3{pm} 3.3{pm} 3.3{pm} 3.3{pm}
        `
};
