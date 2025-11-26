import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';
import { ArgumentListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTexShared';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';

export const bd: PropertyDefinition = {
    property: 'bd',
    snippet: 'bd$0',
    shortDescription: 'Downwards brush-stroke',
    longDescription: `Adds a brush stroke effect to the beat.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'duration',
                    shortDescription: 'A custom duration of the stroke speed in MIDI ticks',
                    type: AlphaTexNodeType.Number,
                    parseMode: ArgumentListParseTypesMode.Optional
                }
            ]
        }
    ],
    examples: `
        :2 (0.1 0.2 0.3 2.4 2.5 0.6){bd} (0.1 0.2 0.3 2.4 2.5 0.6){bu} |
        (0.1 0.2 0.3 2.4 2.5 0.6){bd 360} (0.1 0.2 0.3 2.4 2.5 0.6){bu 60}
        `
};
