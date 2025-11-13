import type { PropertyDoc } from '../../types';

export const turn: PropertyDoc = {
    property: 'turn',
    syntax: ['turn'],
    snippet: 'turn',
    shortDescription: 'Turn Ornament',
    longDescription: 'Applies a turn ornament to the note.',
    values: [],
    examples: 
        `
        :1 C4{turn} |
        `
};
