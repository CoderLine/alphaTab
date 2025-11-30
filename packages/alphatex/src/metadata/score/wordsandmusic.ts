import { noValueSongMetaDataSignatures } from '@coderline/alphatab-alphatex/metadata/score/title';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const wordsAndMusic: MetadataTagDefinition = {
    tag: '\\wordsAndMusic',
    snippet: '\\wordsAndMusic ("${1:Words & Music by %MUSIC%}" ${2:left})$0',
    shortDescription: `Sets the template and text align for combined words and music authors.`,
    signatures: noValueSongMetaDataSignatures,
    examples: `
        \\words "CoderLine"
        \\music "CoderLine"
        \\wordsAndMusic ("Words & Music: %WORDS%")
        C4
        `
};
