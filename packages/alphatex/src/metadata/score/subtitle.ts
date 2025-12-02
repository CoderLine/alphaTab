import { songMetaDataSignatures } from '@coderline/alphatab-alphatex/metadata/score/title';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const subtitle: MetadataTagDefinition = {
    tag: '\\subtitle',
    snippet: '\\subtitle "$1"$0',
    shortDescription: `Set the subtitle of the song.`,
    signatures: songMetaDataSignatures,
    examples: `
        \\title ("Song Title" "Title: %TITLE%" left)
        \\subtitle ("Subtitle" "[%SUBTITLE%]" left)
        C4
        `
};
