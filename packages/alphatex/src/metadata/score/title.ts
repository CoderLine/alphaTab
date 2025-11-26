import { ArgumentListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';
import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type {
    MetadataTagDefinition,
    SignatureDefinition
} from '@coderline/alphatab-alphatex/types';

export const songMetaDataSignatures: SignatureDefinition[] = [
    {
        parameters: [
            {
                name: 'value',
                shortDescription: 'The value to set',
                type: AlphaTexNodeType.String,
                allowAllStringTypes: true,
                parseMode: ArgumentListParseTypesMode.Required
            },
            {
                name: 'template',
                shortDescription: 'The template used to render the text',
                type: AlphaTexNodeType.String,
                parseMode: ArgumentListParseTypesMode.Optional
            },
            {
                name: 'textAlign',
                shortDescription: 'The alignment of the text on the music sheet',
                parseMode: ArgumentListParseTypesMode.Optional,
                ...enumParameter('TextAlign')
            }
        ]
    }
];
export const noValueSongMetaDataSignatures: SignatureDefinition[] = [
    {
        parameters: [
            {
                name: 'template',
                shortDescription: 'The template used to render the text',
                type: AlphaTexNodeType.String,
                parseMode: ArgumentListParseTypesMode.Required
            },
            {
                name: 'textAlign',
                shortDescription: 'The alignment of the text on the music sheet',
                parseMode: ArgumentListParseTypesMode.Optional,
                ...enumParameter('TextAlign')
            }
        ]
    }
];

export const title: MetadataTagDefinition = {
    tag: '\\title',
    snippet: '\\title "$1"$0',
    shortDescription: `Set the title of the song.`,
    signatures: songMetaDataSignatures,
    examples: `y
        \\title ("Song Title" "Title: %TITLE%" left)
        C4
        `
};
