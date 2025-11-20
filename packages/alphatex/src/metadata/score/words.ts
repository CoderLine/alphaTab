import { songMetaDataSignatures } from '@coderline/alphatab-alphatex/metadata/score/title';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const words: MetadataTagDefinition = {
    tag: '\\words',
    snippet: '\\words "$1"$0',
    shortDescription: `Set the lyrics author of the song.`,
    signatures: songMetaDataSignatures,
    examples: `
        \\words "CoderLine"
        C4
        `
};
