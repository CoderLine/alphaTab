import type { MetadataDoc } from '@src/documentation/types';

export const showDynamics: MetadataDoc = {
    tag: '\\showDynamics',
    syntax: ['\\showDynamics'],
    snippet: '\\showDynamics',
    shortDescription: `Enables the display of dynamics.`,
    values: [],
    examples: `
        \\showDynamics
            C4 {dy FFF} D4
            E4 {dy PP} F4
        `
};
