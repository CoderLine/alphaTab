import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { ParameterDefinition, PropertyDefinition } from '@coderline/alphatab-alphatex/types';
import { ArgumentListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';

const type: ParameterDefinition = {
    name: 'type',
    shortDescription: 'The type of whammy (affects the display).',
    parseMode: ArgumentListParseTypesMode.Required,
    ...enumParameter('WhammyType')
};

const style: ParameterDefinition = {
    name: 'style',
    shortDescription: 'The style of the whammy.',
    parseMode: ArgumentListParseTypesMode.Required,
    ...enumParameter('BendStyle')
};

const values: ParameterDefinition = {
    name: 'valuesAndOffsets',
    shortDescription: 'The offset and then the value of the whammy',
    longDescription: `The offset at which the value becomes valid in range of 0-60 and 
    The value of the whammy in quarter-tones relative to the original note, decimals supported.
    The offset and value are actually two parameters: 
    \`3.3.1{tbe (0 0 5 4 30 8 60 0)}\`
    `,
    parseMode: ArgumentListParseTypesMode.ValueListWithoutParenthesis,
    type: AlphaTexNodeType.Number
};

export const tbe: PropertyDefinition = {
    property: 'tbe',
    snippet: 'tbe ($1)$0',
    shortDescription: 'Tremolo Bar (Whammy) Exact',
    longDescription: `
        Adds a whammy bar (aka. tremolo bar) effect to the beat.

        * The \`tb\` variant automatically spreads the values across the duration of the beat.
        * The \`tbe\` (exact) variant allows specifying exactly at which offset a value is placed.
         
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
        3.3.1{tb (0 4 0 8)} | r |
        3.3.1{tb (0 -4 0 -8)} | r |
        3.3.1{tbe (0 0 5 4 30 8 60 0)}
        `
};
