import { instrument } from '@coderline/alphatab-alphatex/properties/beat/instrument';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const instrumentMeta: MetadataTagDefinition = {
    tag: '\\instrument',
    snippet: '\\instrument "$1"$0',
    shortDescription: 'Instrument',
    hidden: true,
    longDescription: `Defines the instrument for the track.`,
    deprecated: 'Use the track property instead',
    signatures: instrument.signatures,
    examples: ``
};
