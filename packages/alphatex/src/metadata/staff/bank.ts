import { bank } from '@coderline/alphatab-alphatex/properties/beat/bank';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const instrumentMeta: MetadataTagDefinition = {
    tag: '\\bank',
    snippet: '\\bank $1$0',
    shortDescription: 'MIDI Bank',
    hidden: true,
    longDescription: `Defines the midi bank for the track.`,
    deprecated: 'Use the track property instead',
    signatures: bank.signatures,
    examples: ``
};
