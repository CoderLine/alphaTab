import { songMetaDataSignatures } from '@coderline/alphatab-alphatex/metadata/score/title';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const music: MetadataTagDefinition = {
    tag: '\\music',
    snippet: '\\music "$1"$0',
    shortDescription: `Set the music author of the song.`,
    signatures: songMetaDataSignatures,
    examples: `
        \\music "CoderLine and Contributors"
        C4
        `
};
