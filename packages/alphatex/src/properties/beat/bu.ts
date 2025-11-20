import type { PropertyDefinition } from '@coderline/alphatab-alphatex/types';
import { ValueListParseTypesMode } from '@coderline/alphatab/importer/alphaTex/AlphaTex1LanguageDefinitions';
import { AlphaTexNodeType } from '@coderline/alphatab/importer/alphaTex/AlphaTexAst';

export const bu: PropertyDefinition = {
    property: 'bu',
    snippet: 'bu$0',
    shortDescription: 'Upwards brush-stroke',
    longDescription: `Adds a brush stroke effect to the beat.`,
    signatures: [
        {
            parameters: [
                {
                    name: 'duration',
                    shortDescription: 'A custom duration of the stroke speed in MIDI ticks',
                    type: AlphaTexNodeType.Number,
                    parseMode: ValueListParseTypesMode.Optional
                }
            ]
        }
    ],
    examples: `
        :2 (0.1 0.2 0.3 2.4 2.5 0.6){bd} (0.1 0.2 0.3 2.4 2.5 0.6){bu} |
        (0.1 0.2 0.3 2.4 2.5 0.6){bd 360} (0.1 0.2 0.3 2.4 2.5 0.6){bu 60}
        `
};
