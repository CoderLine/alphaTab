import type { PropertyDoc } from '@coderline/alphatab-lsp/documentation/types';

export const bank: PropertyDoc = {
    property: 'bank',
    syntax: ['bank value'],
    snippet: 'bank $1$0',
    shortDescription: 'MIDI Bank Change',
    longDescription: `Adds a instrument bank change to the beat.`,
    values: [
        {
            name: 'value',
            shortDescription: 'The new MIDI bank',
            type: '`number`',
            required: true
        }
    ],
    examples: `
        C4 C4 C4 {instrument 25 bank 2} C4
        `
};
