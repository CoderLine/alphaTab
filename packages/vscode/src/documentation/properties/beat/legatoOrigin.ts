import type { PropertyDoc } from '../../types';

export const legatoOrigin: PropertyDoc = {
    property: 'legatoOrigin',
    syntax: ['legatoOrigin'],
    snippet: 'legatoOrigin',
    shortDescription: 'Legato',
    longDescription: `Adds a legato from this beat to the next one.`,
    values: [],
    examples: 
        `
        3.3.4{ legatoOrigin } 10.3.4
        `
};
