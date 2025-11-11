import type { MetadataDoc } from '../types';

export const showDynamics: MetadataDoc = {
    tag: '\\showDynamics',
    syntax: ['\\showDynamics'],
    snippet: '\\showDynamics',
    description: `Enables the display of dynamics.`,
    values: [],
    example: `
        \\showDynamics
            C4 {dy FFF} D4
            E4 {dy PP} F4
        `
};
