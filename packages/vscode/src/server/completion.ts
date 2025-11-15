import * as alphaTab from '@src/alphaTab.main';
import { Duration } from '@src/model/Duration';
import {
    allMetadata,
    barMetaData,
    beatProperties,
    durationChangeProperties,
    noteProperties,
    scoreMetaData,
    structuralMetaData
} from 'src/documentation/documentation';
import type { MetadataDoc, PropertyDoc, ValueDoc, ValueItemDoc } from 'src/documentation/types';
import type { AlphaTexTextDocument, Connection } from 'src/server/types';
import { binaryNodeSearch } from 'src/server/utils';
import {
    type CompletionItem,
    CompletionItemKind,
    InsertTextFormat,
    type TextDocumentPositionParams,
    type TextDocuments
} from 'vscode-languageserver/lib/node/main';
import type { TextEdit } from 'vscode-languageserver-textdocument';

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

        const bar = binaryNodeSearch(document.ast.bars, offset, true);
        const barIndex = bar ? document.ast.bars.indexOf(bar) : 0;

        const metaData = bar ? binaryNodeSearch(bar.metaData, offset, false) : undefined;
        if (metaData) {
            return sortCompletions(createMetaDataCompletions(barIndex, metaData, offset));
        } else if (!bar || (bar.beats.length > 0 && offset < bar.beats[0].start!.offset)) {
            return sortCompletions(createMetaDataCompletions(barIndex, metaData, offset));
        }

        const beat = binaryNodeSearch(bar.beats, offset, true);
        if (beat) {
            return sortCompletions(createBeatCompletions(beat, offset));
        }

        return sortCompletions(createMetaDataCompletions(barIndex, metaData, offset));
    });

    connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
        return item;
    });
}

function sortCompletions(completions: CompletionItem[]): CompletionItem[] {
    let i = 'a'.charCodeAt(0);
    for (const c of completions) {
        c.sortText = `${String.fromCharCode(i++)}`;
    }
    return completions;
}

const durations: [string, Duration][] = [
    ['Whole Note', Duration.Whole],
    ['Half Note', Duration.Half],
    ['Quarter Note', Duration.Quarter],
    ['8th Note', Duration.Eighth],
    ['16th Note', Duration.Sixteenth],
    ['32nd Note', Duration.ThirtySecond],
    ['64th Note', Duration.SixtyFourth],
    ['128th Note', Duration.OneHundredTwentyEighth],
    ['256th Note', Duration.TwoHundredFiftySixth],
    ['Quadruple Whole Note', Duration.QuadrupleWhole],
    ['Double Whole Note', Duration.DoubleWhole]
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

function createBeatCompletions(beat: alphaTab.importer.alphaTex.AlphaTexBeatNode, offset: number): CompletionItem[] {
    const completions: CompletionItem[] = [];

    if (
        beat.durationChange &&
        beat.durationChange.start!.offset < offset &&
        offset <= beat.durationChange!.end!.offset
    ) {
        return createDurationChangeCompletions(beat.durationChange, offset);
    }

    if (beat.notes && beat.notes.start!.offset < offset && offset <= beat.notes.end!.offset) {
        const note = binaryNodeSearch(beat.notes.notes, offset, false);
        if (note) {
            return createNoteCompletions(beat, note, offset);
        }
    }

    const afterDuration = beat.beatMultiplier?.start?.offset ?? beat.beatEffects?.start?.offset ?? beat.end!.offset;

    if (beat.durationDot && beat.durationDot.start!.offset < offset && (offset <= afterDuration || !beat.beatEffects)) {
        const replacement: TextEdit[] | undefined = beat.durationValue
            ? [
                  {
                      range: {
                          start: {
                              line: beat.durationDot.end!.line - 1,
                              character: beat.durationDot.end!.col
                          },
                          end: {
                              line: beat.durationValue!.end!.line - 1,
                              character: beat.durationValue!.end!.col - 1
                          }
                      },
                      newText: ' '
                  }
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
        completions.splice(0, 0, ...createPropertiesCompletions(beat.beatEffects, offset, beatProperties));
    }

    return completions;
}

function createDurationChangeCompletions(
    durationChange: alphaTab.importer.alphaTex.AlphaTexBeatDurationChangeNode,
    offset: number
): CompletionItem[] {
    const completions: CompletionItem[] = [];

    if (!durationChange.properties || offset < durationChange.properties.start!.offset) {
        const endOfValue = durationChange.properties?.start ?? durationChange.end!;
        const replacement: TextEdit[] | undefined = durationChange.properties
            ? [
                  {
                      range: {
                          start: {
                              line: durationChange.colon.start!.line - 1,
                              character: durationChange.colon.start!.col
                          },
                          end: {
                              line: endOfValue.line - 1,
                              character: endOfValue.col - 1
                          }
                      },
                      newText: ''
                  }
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
        completions.push(...createPropertiesCompletions(durationChange.properties, offset, durationChangeProperties));
    }

    return completions;
}

function createNoteCompletions(
    beat: alphaTab.importer.alphaTex.AlphaTexBeatNode,
    note: alphaTab.importer.alphaTex.AlphaTexNoteNode,
    offset: number
): CompletionItem[] {
    const completions: CompletionItem[] = [];
    if (note.noteEffects && note.noteEffects.start!.offset < offset && note.noteEffects.end!.offset) {
        if (beat.notes!.notes.length === 1) {
            completions.splice(0, 0, ...createPropertiesCompletions(note.noteEffects, offset, beatProperties));
        }

        completions.splice(0, 0, ...createPropertiesCompletions(note.noteEffects, offset, noteProperties));
    }
    return completions;
}

function propertyToCompletion(p: PropertyDoc): CompletionItem {
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
        insertTextFormat: InsertTextFormat.Snippet
    };
}
function valueItemToCompletion(i: ValueItemDoc, more?: Partial<CompletionItem>): CompletionItem {
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

function metaDataDocToCompletion(d: MetadataDoc): CompletionItemWithData<MetaDataCompletionData> {
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
    offset: number
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
            const keepValues = metaData.values || metaData.properties;
            completions = completions.map(c => ({
                ...c,
                insertText: keepValues ? c.label : c.insertText,
                additionalTextEdits: [
                    {
                        range: {
                            start: {
                                line: metaData.tag.start!.line - 1,
                                character: metaData.tag.start!.col - 1
                            },
                            end: {
                                line: metaData.tag.end!.line - 1,
                                character: metaData.tag.end!.col - 1
                            }
                        },
                        newText: ''
                    }
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

    completions.splice(0, 0, ...createValueCompletions(metaDataDocs.values, metaData.values, offset));

    if (metaDataDocs?.properties) {
        completions.splice(0, 0, ...createPropertiesCompletions(metaData.properties, offset, metaDataDocs.properties));
    }

    return completions;
}

function createValueCompletions(
    expectedValues: ValueDoc[],
    actualValues: alphaTab.importer.alphaTex.AlphaTexValueList | undefined,
    offset: number
) {
    const requiredValues = expectedValues.filter(v => v.required);
    if (!actualValues && requiredValues.length > 0) {
        if (requiredValues[0].values) {
            const identifiers =
                requiredValues[0].values.get(alphaTab.importer.alphaTex.AlphaTexNodeType.Ident) ??
                requiredValues[0].values.get(alphaTab.importer.alphaTex.AlphaTexNodeType.String) ??
                requiredValues[0].values.get(alphaTab.importer.alphaTex.AlphaTexNodeType.Number);
            if (identifiers) {
                return identifiers.map(i => valueItemToCompletion(i));
            }
        }
    } else if (actualValues) {
        const value = binaryNodeSearch(actualValues.values, offset);
        if (value) {
            const valueIndex = actualValues.values.indexOf(value);
            const values =
                valueIndex < expectedValues.length ? expectedValues[valueIndex].values?.get(value.nodeType) : undefined;
            if (values) {
                return values.map(i =>
                    valueItemToCompletion(i, {
                        additionalTextEdits: [
                            {
                                range: {
                                    start: {
                                        line: value.start!.line - 1,
                                        character: value.start!.col - 1
                                    },
                                    end: {
                                        line: value.end!.line - 1,
                                        character: value.end!.col - 1
                                    }
                                },
                                newText: ''
                            }
                        ]
                    })
                );
            }
        }
    }

    return [];
}

function createMetaDataDocCompletions(
    metaData: Map<string, MetadataDoc>
): CompletionItemWithData<MetaDataCompletionData>[] {
    return Array.from(metaData.values()).map(metaDataDocToCompletion);
}

function createPropertiesCompletions(
    properties: alphaTab.importer.alphaTex.AlphaTexPropertiesNode | undefined,
    offset: number,
    availableProperties: Map<string, PropertyDoc>
): CompletionItem[] {
    if (!properties) {
        return [];
    }

    const end = properties.closeBrace?.start?.offset ?? properties.end!.offset;
    if (offset < properties.openBrace!.start!.offset || offset > end) {
        return [];
    }

    const allPropCompletions: CompletionItem[] = Array.from(availableProperties.values()).map(propertyToCompletion);

    const prop = properties ? binaryNodeSearch(properties.properties, offset, true) : undefined;
    if (prop) {
        return createPropertyCompletions(prop, offset, availableProperties, allPropCompletions);
    }

    return allPropCompletions;
}

function createPropertyCompletions(
    property: alphaTab.importer.alphaTex.AlphaTexPropertyNode,
    offset: number,
    availableProperties: Map<string, PropertyDoc>,
    allPropCompletions: CompletionItem[]
) {
    const completions: CompletionItem[] = [];
    const propCompletion =
        !property || (property.property.start!.offset <= offset && offset <= property.property.end!.offset);
    if (propCompletion) {
        completions.push(
            ...allPropCompletions.map(c => ({
                ...c,
                additionalTextEdits: [
                    {
                        range: {
                            start: {
                                line: property.property.start!.line - 1,
                                character: property.property.start!.col - 1
                            },
                            end: {
                                line: property.property.end!.line - 1,
                                character: property.property.end!.col - 1
                            }
                        },
                        newText: ''
                    }
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

    completions.splice(0, 0, ...createValueCompletions(propDocs.values, property.values, offset));

    return completions;
}
