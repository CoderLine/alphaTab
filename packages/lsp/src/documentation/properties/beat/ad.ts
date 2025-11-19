import type { PropertyDoc } from '@coderline/alphatab-lsp/documentation/types';

export const ad: PropertyDoc = {
    property: 'ad',
    syntax: ['ad duration'],
    snippet: 'ad$0',
    shortDescription: 'Downwards Arpeggio',
    longDescription: `Adds an arpeggio effect to the beat.`,
    values: [
        {
            name: 'duration',
            shortDescription: 'A custom duration of the stroke speed in MIDI ticks',
            type: '`number`',
            required: false
        }
    ],
    examples: `
        (0.1 0.2 0.3 2.4 2.5 0.6){ad} (0.1 0.2 0.3 2.4 2.5 0.6){au} |
        `
};
