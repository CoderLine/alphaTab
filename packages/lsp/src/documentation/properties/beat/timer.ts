import type { PropertyDoc } from '@coderline/alphatab-lsp/documentation/types';

export const timer: PropertyDoc = {
    property: 'timer',
    syntax: ['timer'],
    snippet: 'timer',
    shortDescription: 'Show timestamp',
    longDescription: `
    Adds a timestamp marker to the beat.

    Timers are showing the exact timestamp when a beat is played the first time (respecting aspects like repeats).
    `,
    values: [],
    examples: 
        `
        \\tempo 120
        3.3.4 { timer } 3.3.4*3 |
        \\ro 3.3.4 { timer } 3.3.4*3 |
        3.3.4 { timer } 3.3.4*3 |
        \\jump fine 3.3.4 { timer } 3.3.4*3 |
        \\ae (1) 3.3.4 { timer } 3.3.4*3 |
        \\ae (2 3) \\rc 3 3.3.4 { timer } 3.3.4*3 |
        3.3.4 { timer } 3.3.4*3 |
        \\jump DaCapoAlFine 3.3.4 { timer } 3.3.4*3 |
        3.3.4 { timer } 3.3.4*3
        `
};
