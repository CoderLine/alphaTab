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
    shortDescription: 'The style of the whammy play style.',
    parseMode: ArgumentListParseTypesMode.Required,
    ...enumParameter('BendStyle')
};

const values: ParameterDefinition = {
    name: 'valueAndOffset',
    shortDescription: 'The offset and then the value of the bend',
    longDescription: `The offset at which the value becomes valid in range of 0-60 and 
    The value of the bend in quarter-tones relative to the original note.
    The offset and value are actually two parameters: 
    \`3.3 {be (0 0 5 2 30 4)}\`
    `,
    parseMode: ArgumentListParseTypesMode.RequiredAsValueList,
    type: AlphaTexNodeType.Number
};

export const be: PropertyDefinition = {
    property: 'be',
    snippet: 'be ($1)$0',
    shortDescription: 'Note Bend (exact)',
    longDescription: `
        Adds an exact bend effect to the note.

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
        :1 3.3 {be (0 0 5 2 30 4)}
        `
};
