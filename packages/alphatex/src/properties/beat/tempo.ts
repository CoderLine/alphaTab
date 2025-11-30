import * as alphaTab from '@coderline/alphatab';
import type { ParameterDefinition, PropertyDefinition } from '@coderline/alphatab-alphatex/types';

const bpm: ParameterDefinition = {
    name: 'bpm',
    shortDescription: 'The new tempo in BPM',
    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Number,
    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required
};
const label: ParameterDefinition = {
    name: 'label',
    shortDescription: 'A textual label for the tempo',
    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required,
    type: alphaTab.importer.alphaTex.AlphaTexNodeType.String,
    defaultValue: '""'
};

const hide: ParameterDefinition = {
    name: 'hide',
    shortDescription: 'If specified, the tempo change is not shown in the music sheet',
    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Ident,
    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Optional,
    values: [
        {
            name: 'hide',
            shortDescription: 'If specified, the tempo change is not shown in the music sheet',
            snippet: 'hide'
        }
    ]
};

export const beatTempo: PropertyDefinition = {
    property: 'tempo',
    snippet: 'tempo $1$0',
    shortDescription: 'Tempo Change',
    longDescription: `Add a tempo change to the beat.`,
    signatures: [
        {
            parameters: [bpm, hide]
        },
        {
            parameters: [bpm, label, hide]
        }
    ],
    examples: `
        C4 {tempo 120} D4 E4 {tempo 140} F4 | C4.8 {tempo 80} C4 D4 {tempo 100} D4 E4 {tempo 120} E4 F4 {tempo 240} F4
        `
};
