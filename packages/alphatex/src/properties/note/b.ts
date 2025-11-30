import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { ParameterDefinition, PropertyDefinition } from '@coderline/alphatab-alphatex/types';
import { ArgumentListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';

const type: ParameterDefinition = {
    name: 'type',
    shortDescription: 'The type of bend (affects the display).',
    parseMode: ArgumentListParseTypesMode.Required,
    ...enumParameter('BendType')
};

const style: ParameterDefinition = {
    name: 'style',
    shortDescription: 'The style of the bend.',
    parseMode: ArgumentListParseTypesMode.Required,
    ...enumParameter('BendStyle')
};

const values: ParameterDefinition = {
    name: 'values',
    shortDescription: 'The values of the bend in quarter-tones relative to the original note, decimals supported',
    parseMode: ArgumentListParseTypesMode.ValueListWithoutParenthesis,
    type: AlphaTexNodeType.Number
};

export const b: PropertyDefinition = {
    property: 'b',
    snippet: 'b ($1)$0',
    shortDescription: 'Note Bend',
    longDescription: `
        Adds a bend effect to the note.

        * The \`b\` variant automatically spreads the values across the duration of the beat.
        * The \`be\` (exact) variant allows specifying exactly at which offset a value is placed.
    
        It is recommended to rely on the auto-detection of the type and only specify the type explicitly if something is wrong.
    `,
    signatures: [
        {
            parameters: [values]
        },
        {
            parameters: [type, values]
        },
        {
            parameters: [style, values]
        },
        {
            parameters: [type, style, values]
        }
    ],
    examples: `
        3.3{b (0 4)} |
        3.3{b (0 4 0 8)} |
        `
};
