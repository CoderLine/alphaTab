import * as alphaTab from '@coderline/alphatab';
import { enumParameter } from '@coderline/alphatab-alphatex/enum';
import type { MetadataTagDefinition, SignatureDefinition } from '@coderline/alphatab-alphatex/types';

export const songMetaDataSignatures: SignatureDefinition[] = [
    {
        parameters: [
            {
                name: 'value',
                shortDescription: 'The value to set',
                type: alphaTab.importer.alphaTex.AlphaTexNodeType.String,
                allowAllStringTypes: true,
                parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required
            },
            {
                name: 'template',
                shortDescription: 'The template used to render the text',
                type: alphaTab.importer.alphaTex.AlphaTexNodeType.String,
                parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Optional
            },
            {
                name: 'textAlign',
                shortDescription: 'The alignment of the text on the music sheet',
                parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Optional,
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
                type: alphaTab.importer.alphaTex.AlphaTexNodeType.String,
                parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required
            },
            {
                name: 'textAlign',
                shortDescription: 'The alignment of the text on the music sheet',
                parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Optional,
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
    examples: `
        \\title ("Song Title" "Title: %TITLE%" left)
        C4
        `
};
