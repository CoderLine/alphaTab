import type { PropertyDoc } from '../../types';

export const au: PropertyDoc = {
    property: 'au',
    syntax: ['au duration'],
    snippet: 'au$0',
    shortDescription: 'Upwards Arpeggio',
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
