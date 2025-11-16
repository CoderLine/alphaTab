import type { PropertyDoc } from '@src/documentation/types';

export const dy: PropertyDoc = {
    property: 'dy',
    syntax: ['dy dynamic'],
    snippet: 'dy $1$0',
    shortDescription: 'Dynamics',
    longDescription: `Defines the play dynamics for this beat.`,
    values: [
        {
            name: 'dynamic',
            shortDescription: 'The dynamic value to apply',
            type: '`identifier`',
            required: true,
            
        }
    ],
    examples: `
        \\chord ("C" 0 1 0 2 3 x)
        \\ts 2 4
        (0.1 1.2 0.3 2.4 3.5){ch "C"} (0.1 1.2 0.3 2.4 3.5) |
        (0.1 2.2 2.3 2.4 0.5){ch "A"}
        `
};
