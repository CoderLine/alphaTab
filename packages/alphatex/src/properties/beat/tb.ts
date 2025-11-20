import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { ParameterDefinition, PropertyDefinition } from '@coderline/alphatab-alphatex/types';
import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTex1LanguageDefinitions';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';

const type: ParameterDefinition = {
    name: 'type',
    shortDescription: 'The type of whammy (affects the display).',
    parseMode: ValueListParseTypesMode.Required,
    ...enumParameter('WhammyType')
};

const style: ParameterDefinition = {
    name: 'style',
    shortDescription: 'The style of the whammy play style.',
    parseMode: ValueListParseTypesMode.Required,
    ...enumParameter('BendStyle')
};

const values: ParameterDefinition = {
    name: 'values',
    shortDescription: 'The values of the whammy in quarter-tones relative to the original note, decimals supported',
    parseMode: ValueListParseTypesMode.RequiredAsValueList,
    type: AlphaTexNodeType.Number
};

export const tb: PropertyDefinition = {
    property: 'tb',
    snippet: 'tb ($1)$0',
    shortDescription: 'Tremolo Bar (Whammy)',
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
