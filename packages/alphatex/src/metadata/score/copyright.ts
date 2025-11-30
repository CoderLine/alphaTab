import { songMetaDataSignatures } from '@coderline/alphatab-alphatex/metadata/score/title';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const copyright: MetadataTagDefinition = {
    tag: '\\copyright',
    snippet: '\\copyright "$1"$0',
    shortDescription: `Set the copyright owner of the song.`,
    signatures: songMetaDataSignatures,
    examples: `
        \\copyright "CoderLine"
        C4
        `
};
