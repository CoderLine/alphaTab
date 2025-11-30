import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const showDynamics: MetadataTagDefinition = {
    tag: '\\showDynamics',
    snippet: '\\showDynamics',
    shortDescription: `Enables the display of dynamics.`,
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        \\showDynamics
            C4 {dy FFF} D4
            E4 {dy PP} F4
        `
};
