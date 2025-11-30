import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';

export const turn: PropertyDefinition = {
    property: 'turn',
    snippet: 'turn',
    shortDescription: 'Turn Ornament',
    longDescription: 'Applies a turn ornament to the note.',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: `
        :1 C4{turn} |
        `
};
