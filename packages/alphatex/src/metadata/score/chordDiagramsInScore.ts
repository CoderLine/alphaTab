import * as alphaTab from '@coderline/alphatab';
import type { MetadataTagDefinition } from '@coderline/alphatab-alphatex/types';

export const chordDiagramsInScore: MetadataTagDefinition = {
    tag: '\\chordDiagramsInScore',
    snippet: '\\chordDiagramsInScore',
    shortDescription: 'Show inline chord diagrams in score.',
    longDescription: `Configures whether chord diagrams are shown inline in the score..`,
    signatures: [
        {
            parameters: [
                {
                    name: 'visibility',
                    shortDescription: 'The visibility of the diagrams',
                    parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Optional,
                    defaultValue: 'true',
                    type: alphaTab.importer.alphaTex.AlphaTexNodeType.Ident,
                    values: [
                        { name: 'true', snippet: 'true', shortDescription: 'Show the diagrams' },
                        { name: 'false', snippet: 'false', shortDescription: 'Hide the diagrams' }
                    ]
                }
            ]
        }
    ],
    examples: [
        `
        \\chordDiagramsInScore
        \\chord ("E" 0 0 1 2 2 0)
        (0.1 0.2 1.3 2.4 2.5 0.6){ch "E"}
        `
    ]
};
