import * as alphaTab from '@coderline/alphatab';
import {
    allMetadata,
    barMetaData,
    beatProperties,
    durationChangeProperties,
    noteProperties,
    scoreMetaData,
    structuralMetaData
} from '@coderline/alphatab-alphatex/definitions';
import type {
    MetadataTagDefinition,
    ParameterValueDefinition,
    PropertyDefinition,
    SignatureDefinition
} from '@coderline/alphatab-alphatex/types';
import type { AlphaTexTextDocument, Connection } from '@coderline/alphatab-language-server/server/types';
import {
    type CompletionItem,
    CompletionItemKind,
    InsertTextFormat,
    type RemoteConsole,
    type TextDocumentPositionParams,
    type TextDocuments,
    TextEdit
} from '@coderline/alphatab-language-server/server/types';
import { binaryNodeSearch, resolveSignature } from '@coderline/alphatab-language-server/server/utils';

interface MetaDataCompletionData {
    tagLowerCase: string;
    tag: string;
}

interface CompletionItemWithData<T> extends CompletionItem {
    data: T;
}

const topLevelCompletions = [
    ...createMetaDataDocCompletions(structuralMetaData),
    ...createMetaDataDocCompletions(scoreMetaData),
    ...createMetaDataDocCompletions(barMetaData)
];

export function setupCompletion(connection: Connection, documents: TextDocuments<AlphaTexTextDocument>) {
    connection.onCompletion((params: TextDocumentPositionParams): CompletionItem[] => {
        const document = documents.get(params.textDocument.uri);
        if (!document?.ast) {
            return topLevelCompletions;
        }

        const offset = document.offsetAt(params.position);

        const bar = binaryNodeSearch(document.ast.bars, offset, Number.MAX_SAFE_INTEGER);
        const barIndex = bar ? document.ast.bars.indexOf(bar) : 0;

        // no bar
        if (!bar) {
            return sortCompletions(
                createMetaDataCompletions(barIndex, undefined, offset, Number.MAX_SAFE_INTEGER),
                connection.console
            );
        }

        const endOfBar =
            bar.pipe?.start!.offset ??
            (barIndex === document.ast.bars.length - 1
                ? Number.MAX_SAFE_INTEGER
                : document.ast.bars[barIndex + 1].start!.offset);

        const endOfBarMetaData = bar.beats[0]?.start!.offset ?? endOfBar;
        const metaData = bar ? binaryNodeSearch(bar.metaData, offset, endOfBarMetaData) : undefined;
        if (metaData) {
            const metaDataIndex = bar.metaData.indexOf(metaData);
            const endOfMetaData =
                metaDataIndex === bar.metaData.length - 1
                    ? endOfBarMetaData
                    : bar.metaData[metaDataIndex + 1].start!.offset;
            return sortCompletions(
                createMetaDataCompletions(barIndex, metaData, offset, endOfMetaData),
                connection.console
            );
        }

        const beat = binaryNodeSearch(bar.beats, offset, endOfBar);
        if (beat) {
            const beatIndex = bar.beats.indexOf(beat);
            const endOfBeat = beatIndex === bar.beats.length - 1 ? endOfBar : bar.beats[beatIndex + 1].start!.offset;

            return sortCompletions(createBeatCompletions(beat, offset, endOfBeat), connection.console);
        }

        return sortCompletions(
            createMetaDataCompletions(barIndex, undefined, offset, Number.MAX_SAFE_INTEGER),
            connection.console
        );
    });

    connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
        return item;
    });
}

function sortCompletions(completions: CompletionItem[], console: RemoteConsole): CompletionItem[] {
    let i = 'a'.charCodeAt(0);
    for (const c of completions) {
        c.sortText = `${String.fromCharCode(i++)}`;
    }
    console.debug(`Provide completions: ${JSON.stringify(completions)}`);
    return completions;
}

const durations: [string, alphaTab.model.Duration][] = [
    ['Whole Note', alphaTab.model.Duration.Whole],
    ['Half Note', alphaTab.model.Duration.Half],
    ['Quarter Note', alphaTab.model.Duration.Quarter],
    ['8th Note', alphaTab.model.Duration.Eighth],
    ['16th Note', alphaTab.model.Duration.Sixteenth],
    ['32nd Note', alphaTab.model.Duration.ThirtySecond],
    ['64th Note', alphaTab.model.Duration.SixtyFourth],
    ['128th Note', alphaTab.model.Duration.OneHundredTwentyEighth],
    ['256th Note', alphaTab.model.Duration.TwoHundredFiftySixth],
    ['Quadruple Whole Note', alphaTab.model.Duration.QuadrupleWhole],
    ['Double Whole Note', alphaTab.model.Duration.DoubleWhole]
];

const durationCompletionItems = durations.map(
    d =>
        ({
            label: `${d[1] as number}`,
            labelDetails: {
                description: d[0]
            },
            kind: CompletionItemKind.Value,
            insertText: `${d[1] as number} `,
            insertTextFormat: InsertTextFormat.Snippet
        }) satisfies CompletionItem
);

function createBeatCompletions(
    beat: alphaTab.importer.alphaTex.AlphaTexBeatNode,
    offset: number,
    endOfBeat: number
): CompletionItem[] {
    const completions: CompletionItem[] = [];

    if (
        beat.durationChange &&
        beat.durationChange.start!.offset < offset &&
        offset <= beat.durationChange!.end!.offset
    ) {
        const endOfDurationChange = beat.notes?.start!.offset ?? endOfBeat;
        return createDurationChangeCompletions(beat.durationChange, offset, endOfDurationChange);
    }

    if (beat.notes && beat.notes.start!.offset < offset && offset <= beat.notes.end!.offset) {
        const endOfNotes =
            beat.notes?.closeParenthesis?.start!.offset ??
            beat.durationDot?.start!.offset ??
            beat.beatEffects?.start!.offset ??
            beat.beatMultiplier?.start!.offset ??
            endOfBeat;
        const note = binaryNodeSearch(beat.notes.notes, offset, endOfNotes);
        if (note) {
            const noteIndex = beat.notes.notes.indexOf(note);
            const endOfNote =
                noteIndex === beat.notes.notes.length - 1 ? endOfNotes : beat.notes.notes[noteIndex + 1].start!.offset;
            return createNoteCompletions(beat, note, offset, endOfNote);
        }
    }

    const afterDuration = beat.beatMultiplier?.start?.offset ?? beat.beatEffects?.start?.offset ?? beat.end!.offset;

    if (beat.durationDot && beat.durationDot.start!.offset < offset && (offset <= afterDuration || !beat.beatEffects)) {
        const replacement: TextEdit[] | undefined = beat.durationValue
            ? [
                  TextEdit.del({
                      start: {
                          line: beat.durationDot.end!.line - 1,
                          character: beat.durationDot.end!.col - 1
                      },
                      end: {
                          line: beat.durationValue!.end!.line - 1,
                          character: beat.durationValue!.end!.col - 1
                      }
                  })
              ]
            : undefined;

        completions.push(
            ...durationCompletionItems.map(
                d =>
                    ({
                        ...d,
                        additionalTextEdits: replacement
                    }) satisfies CompletionItem
            )
        );
    }

    if (beat.beatEffects && beat.beatEffects.start!.offset < offset && beat.beatEffects.end!.offset) {
        const endOfProperties =
            beat.beatEffects?.closeBrace?.start!.offset ?? beat.beatMultiplier?.start!.offset ?? endOfBeat;
        completions.splice(
            0,
            0,
            ...createPropertiesCompletions(beat.beatEffects, offset, beatProperties, endOfProperties)
        );
    }

    return completions;
}

function createDurationChangeCompletions(
    durationChange: alphaTab.importer.alphaTex.AlphaTexBeatDurationChangeNode,
    offset: number,
    endOfDurationChange: number
): CompletionItem[] {
    const completions: CompletionItem[] = [];

    if (!durationChange.properties || offset < durationChange.properties.start!.offset) {
        const endOfValue = durationChange.properties?.start ?? durationChange.end!;
        const replacement: TextEdit[] | undefined = durationChange.properties
            ? [
                  TextEdit.del({
                      start: {
                          line: durationChange.colon.start!.line - 1,
                          character: durationChange.colon.start!.col - 1
                      },
                      end: {
                          line: endOfValue.line - 1,
                          character: endOfValue.col - 1
                      }
                  })
              ]
            : undefined;

        completions.push(
            ...durationCompletionItems.map(d => ({
                ...d,
                additionalTextEdits: replacement
            }))
        );
    } else if (
        durationChange.properties &&
        durationChange.properties.start!.offset < offset &&
        durationChange.properties.end!.offset
    ) {
        const endOfProperties = durationChange.properties?.closeBrace?.start!.offset ?? endOfDurationChange;
        completions.push(
            ...createPropertiesCompletions(durationChange.properties, offset, durationChangeProperties, endOfProperties)
        );
    }

    return completions;
}

function createNoteCompletions(
    beat: alphaTab.importer.alphaTex.AlphaTexBeatNode,
    note: alphaTab.importer.alphaTex.AlphaTexNoteNode,
    offset: number,
    endOfNote: number
): CompletionItem[] {
    const completions: CompletionItem[] = [];
    if (note.noteEffects && note.noteEffects.start!.offset < offset && note.noteEffects.end!.offset) {
        const endOfProperties = note.noteEffects.closeBrace?.start!.offset ?? endOfNote;

        if (beat.notes!.notes.length === 1) {
            completions.splice(
                0,
                0,
                ...createPropertiesCompletions(note.noteEffects, offset, beatProperties, endOfProperties)
            );
        }

        completions.splice(
            0,
            0,
            ...createPropertiesCompletions(note.noteEffects, offset, noteProperties, endOfProperties)
        );
    }
    return completions;
}

function propertyToCompletion(p: PropertyDefinition, more?: Partial<CompletionItem>): CompletionItem {
    return {
        label: p.property,
        kind: CompletionItemKind.Property,
        insertText: p.snippet,
        labelDetails: p.shortDescription
            ? {
                  description: p.shortDescription
              }
            : undefined,
        documentation: p.longDescription
            ? {
                  kind: 'markdown',
                  value: p.longDescription
              }
            : undefined,
        insertTextFormat: InsertTextFormat.Snippet,
        ...more
    };
}
function valueItemToCompletion(i: ParameterValueDefinition, more?: Partial<CompletionItem>): CompletionItem {
    return {
        label: i.name,
        kind: CompletionItemKind.Value,
        labelDetails: i.shortDescription
            ? {
                  description: i.shortDescription
              }
            : undefined,
        documentation: i.longDescription
            ? {
                  kind: 'markdown',
                  value: i.longDescription
              }
            : undefined,
        insertText: i.snippet,
        insertTextFormat: InsertTextFormat.Snippet,
        ...more
    };
}

function metaDataDocToCompletion(d: MetadataTagDefinition): CompletionItemWithData<MetaDataCompletionData> {
    return {
        label: d.tag,
        kind: CompletionItemKind.Function,
        labelDetails: d.shortDescription
            ? {
                  description: d.shortDescription
              }
            : undefined,
        documentation: d.longDescription
            ? {
                  kind: 'markdown',
                  value: d.longDescription
              }
            : undefined,
        insertText: d.snippet,
        insertTextFormat: InsertTextFormat.Snippet,
        data: {
            tag: d.tag.substring(1), // cut off backslash
            tagLowerCase: d.tag.substring(1).toLowerCase()
        }
    };
}

function createMetaDataCompletions(
    barIndex: number,
    metaData: alphaTab.importer.alphaTex.AlphaTexMetaDataNode | undefined,
    offset: number,
    endOfMetaData: number
) {
    let completions: CompletionItem[] = [];
    const tagCompletion = !metaData || (metaData.tag.start!.offset <= offset && offset <= metaData.tag.end!.offset);
    if (tagCompletion) {
        if (barIndex === 0) {
            completions.push(...topLevelCompletions);
        } else {
            completions.push(
                ...createMetaDataDocCompletions(structuralMetaData),
                ...createMetaDataDocCompletions(barMetaData)
            );
        }

        if (metaData) {
            const keepValues = metaData.arguments || metaData.properties;
            completions = completions.map(c => ({
                ...c,
                insertText: keepValues ? c.label : c.insertText,
                additionalTextEdits: [
                    TextEdit.del({
                        start: {
                            line: metaData.tag.start!.line - 1,
                            character: metaData.tag.start!.col - 1
                        },
                        end: {
                            line: metaData.tag.end!.line - 1,
                            character: metaData.tag.end!.col - 1
                        }
                    })
                ]
            }));
        }

        return completions;
    } else if (offset >= metaData.end!.offset) {
        if (barIndex === 0) {
            completions.push(...topLevelCompletions);
        } else {
            completions.push(
                ...createMetaDataDocCompletions(structuralMetaData),
                ...createMetaDataDocCompletions(barMetaData)
            );
        }
    }

    const metaDataDocs = allMetadata.get(`\\${metaData.tag.tag.text.toLowerCase()}`);
    if (!metaDataDocs) {
        return completions;
    }

    const endOfArguments =
        metaData.arguments?.closeParenthesis?.start!.offset ??
        metaData.arguments?.end!.offset ??
        metaData.properties?.start!.offset ??
        endOfMetaData;
    completions.splice(
        0,
        0,
        ...createArgumentCompletions(metaDataDocs.signatures, metaData.arguments, offset, endOfArguments)
    );

    if (metaDataDocs?.properties) {
        const endOfProperties = metaData.properties?.closeBrace?.start!.offset ?? endOfMetaData;
        completions.splice(
            0,
            0,
            ...createPropertiesCompletions(metaData.properties, offset, metaDataDocs.properties, endOfProperties)
        );
    }

    return completions;
}

function createArgumentCompletions(
    signatures: SignatureDefinition[],
    actualValues: alphaTab.importer.alphaTex.AlphaTexArgumentList | undefined,
    offset: number,
    trailingEnd: number
) {
    if (actualValues) {
        const value = binaryNodeSearch(actualValues.arguments, offset, trailingEnd);
        if (value?.parameterIndices) {
            const signatureCandidates = resolveSignature(signatures, actualValues);
            for (const [k, v] of signatureCandidates) {
                const parameterIndex = value.parameterIndices.get(k);
                const values = parameterIndex !== undefined ? v.parameters[parameterIndex].values : undefined;
                if (values) {
                    return values.map(i =>
                        valueItemToCompletion(i, {
                            additionalTextEdits: [
                                TextEdit.del({
                                    start: {
                                        line: value.start!.line - 1,
                                        character: value.start!.col - 1
                                    },
                                    end: {
                                        line: value.end!.line - 1,
                                        character: value.end!.col - 1
                                    }
                                })
                            ]
                        })
                    );
                }
            }
        }
    } else {
        const firstParameterValues = signatures.flatMap(s =>
            s.parameters.length > 0 ? (s.parameters[0].values ?? []) : []
        );
        return firstParameterValues.map(i => valueItemToCompletion(i));
    }

    return [];
}

function createMetaDataDocCompletions(
    metaData: Map<string, MetadataTagDefinition>
): CompletionItemWithData<MetaDataCompletionData>[] {
    return Array.from(metaData.values()).map(metaDataDocToCompletion);
}

function createPropertiesCompletions(
    properties: alphaTab.importer.alphaTex.AlphaTexPropertiesNode | undefined,
    offset: number,
    availableProperties: Map<string, PropertyDefinition>,
    endOfProperties: number
): CompletionItem[] {
    if (!properties) {
        return [];
    }

    const end = properties.closeBrace?.start?.offset ?? properties.end!.offset;
    if (offset < properties.openBrace!.start!.offset || offset > end) {
        return [];
    }

    const allPropCompletions: CompletionItem[] = Array.from(availableProperties.values()).map(p =>
        propertyToCompletion(p)
    );

    const prop = properties ? binaryNodeSearch(properties.properties, offset, endOfProperties) : undefined;
    if (prop) {
        const propIndex = properties.properties.indexOf(prop);
        const endOfProp =
            propIndex === properties.properties.length - 1
                ? endOfProperties
                : properties.properties[propIndex + 1].start!.offset;
        return createPropertyCompletions(prop, offset, availableProperties, allPropCompletions, endOfProp);
    }

    return allPropCompletions;
}

function createPropertyCompletions(
    property: alphaTab.importer.alphaTex.AlphaTexPropertyNode,
    offset: number,
    availableProperties: Map<string, PropertyDefinition>,
    allPropCompletions: CompletionItem[],
    endOfProperty: number
) {
    const completions: CompletionItem[] = [];
    const propCompletion =
        !property || (property.property.start!.offset <= offset && offset <= property.property.end!.offset);
    if (propCompletion) {
        completions.push(
            ...allPropCompletions.map(c => ({
                ...c,
                additionalTextEdits: [
                    TextEdit.del({
                        start: {
                            line: property.property.start!.line - 1,
                            character: property.property.start!.col - 1
                        },
                        end: {
                            line: property.property.end!.line - 1,
                            character: property.property.end!.col - 1
                        }
                    })
                ]
            }))
        );
        return completions;
    } else if (offset >= property.end!.offset) {
        completions.push(...allPropCompletions);
    }

    const propDocs = availableProperties.get(property.property.text.toLowerCase());
    if (!propDocs) {
        return completions;
    }

    completions.splice(
        0,
        0,
        ...createArgumentCompletions(propDocs.signatures, property.arguments, offset, endOfProperty)
    );

    return completions;
}
