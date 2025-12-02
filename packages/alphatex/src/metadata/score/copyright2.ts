import { noValueSongMetaDataSignatures } from '@coderline/alphatab-alphatex/metadata/score/title';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const copyright2: MetadataTagDefinition = {
    tag: '\\copyright2',
    snippet: '\\copyright2 ("${1:All Rights Reserved - International Copyright Secured}" ${2:center})$0',
    shortDescription: `Sets the template and text align for the second copyright line.`,
    longDescription: `Sets the template and text align for the second copyright line.
    
    There is no own "value" as it is typically used to just define a static text like "All rights reserved". The "template" can be used for defining the display.`,
    signatures: noValueSongMetaDataSignatures,
    examples: `
        \\copyright "CoderLine"
        \\copyright2 "All rights reserved"
        C4
        `
};
