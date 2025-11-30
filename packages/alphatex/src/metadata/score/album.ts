import { songMetaDataSignatures } from '@coderline/alphatab-alphatex/metadata/score/title';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const album: MetadataTagDefinition = {
    tag: '\\album',
    snippet: '\\album "$1"$0',
    shortDescription: `Set the album of the song.`,
    signatures: songMetaDataSignatures,
    examples: `
        \\title ("Song Title" "Title: %TITLE%" left)
        \\album "alphaTab vol.1"
        C4
        `
};
