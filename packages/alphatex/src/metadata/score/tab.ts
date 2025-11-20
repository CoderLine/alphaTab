import { songMetaDataSignatures } from '@coderline/alphatab-alphatex/metadata/score/title';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const tab: MetadataTagDefinition = {
    tag: '\\tab',
    snippet: '\\tab "$1"$0',
    shortDescription: `Set the transcriber of the music sheet.`,
    signatures: songMetaDataSignatures,
    examples: `
        \\tab "Transcribed by me"
        C4
        `
};
