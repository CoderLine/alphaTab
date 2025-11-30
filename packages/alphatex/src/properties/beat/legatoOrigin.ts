import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const legatoOrigin: PropertyDefinition = {
    property: 'legatoOrigin',
    snippet: 'legatoOrigin',
    shortDescription: 'Legato',
    longDescription: `Adds a legato from this beat to the next one.`,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        3.3.4{ legatoOrigin } 10.3.4
        `
};
