import type { PropertyDoc } from '@src/documentation/types';

export const bd: PropertyDoc = {
    property: 'bd',
    syntax: ['bd duration'],
    snippet: 'bd$0',
    shortDescription: 'Downwards brush-stroke',
    longDescription: `Adds a brush stroke effect to the beat.`,
    values: [
        {
            name: 'duration',
            shortDescription: 'A custom duration of the stroke speed in MIDI ticks',
            type: '`number`',
            required: false
        }
    ],
    examples: `
        :2 (0.1 0.2 0.3 2.4 2.5 0.6){bd} (0.1 0.2 0.3 2.4 2.5 0.6){bu} |
        (0.1 0.2 0.3 2.4 2.5 0.6){bd 360} (0.1 0.2 0.3 2.4 2.5 0.6){bu 60}
        `
};
