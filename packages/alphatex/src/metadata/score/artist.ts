import { songMetaDataSignatures } from '@coderline/alphatab-alphatex/metadata/score/title';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const artist: MetadataTagDefinition = {
    tag: '\\artist',
    snippet: '\\artist "$1"$0',
    shortDescription: `Set the artist of the song.`,
    signatures: songMetaDataSignatures,
    examples: `
        \\title ("Song Title" "Title: %TITLE%" left)
        \\artist "alphaTab"
            C4
        `
};
