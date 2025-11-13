import type { PropertyDoc } from '../../types';

export const beatTempo: PropertyDoc = {
    property: 'tempo',
    syntax: ['tempo bpm', 'tempo (bpm label hide)'],
    snippet: 'tempo $1$0',
    shortDescription: 'Tempo Change',
    longDescription: `Add a tempo change to the beat.`,
    values: [
        {
            name: 'bpm',
            shortDescription: 'The new tempo in BPM',
            type: '`number`',
            required: true
        },
        {
            name: 'label',
            shortDescription: 'A textual label for the tempo',
            type: '`string`',
            required: false
        },
        {
            name: 'hide',
            shortDescription: 'If specified, the tempo change is not shown in the music sheet',
            type: '`identifier`',
            required: false
        }
    ],
    examples: `
        C4 {tempo 120} D4 E4 {tempo 140} F4 | C4.8 {tempo 80} C4 D4 {tempo 100} D4 E4 {tempo 120} E4 F4 {tempo 240} F4
        `
};
