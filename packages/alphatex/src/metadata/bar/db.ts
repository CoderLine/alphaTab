import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const db: MetadataTagDefinition = {
    tag: '\\db',
    snippet: '\\db $0',
    shortDescription: 'Mark a double-bar',
    hidden: true,
    deprecated: 'Use barLineLeft and barLineRight instead',
    signatures: [
        {
            parameters: []
        }
    ],
    examples: ``
};
