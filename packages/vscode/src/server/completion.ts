import * as alphaTab from '@src/alphaTab.main';
import { allMetadata, barMetaData, scoreMetaData, structuralMetaData } from 'src/documentation/documentation';
import type { MetadataDoc, PropertyDoc, ValueDoc } from 'src/documentation/types';
import type { AlphaTexTextDocument, Connection } from 'src/server/types';
import { binaryNodeSearch } from 'src/server/utils';
import {
    type CompletionItem,
    CompletionItemKind,
    InsertTextFormat,
    type TextDocumentPositionParams,
    type TextDocuments
} from 'vscode-languageserver/lib/node/main';

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

        const metaData = bar ? binaryNodeSearch(bar.metaData, offset, true) : undefined;
        if (metaData) {
            return createMetaDataCompletions(barIndex, metaData, offset);
        } else if (!bar || (bar.beats.length > 0 && offset < bar.beats[0].start!.offset)) {
            return createMetaDataCompletions(barIndex, metaData, offset);
        }

        const beat = binaryNodeSearch(bar.beats, offset);
        if (beat) {
            return createBeatCompletions(beat, offset);
        }

        return [];
    });

    connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
        return item;
    });
}

function createBeatCompletions(beat: alphaTab.importer.alphaTex.AlphaTexBeatNode, offset: number): CompletionItem[] {
    // TODO
    return [];
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
            completions = completions.map(c => ({
                ...c,
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

    // value completions
    completions.splice(0, 0, ...createValueCompletions(metaDataDocs.values, metaData.values, offset));

    // property completions
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
    if (!actualValues && requiredValues.length === 1) {
        if (requiredValues[0].values) {
            const identifiers = requiredValues[0].values.get(alphaTab.importer.alphaTex.AlphaTexNodeType.Ident);
            if (identifiers) {
                return identifiers.map(
                    i =>
                        ({
                            label: i.name,
                            sortText: `1_${i.name}`,
                            kind: CompletionItemKind.EnumMember,
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
                            insertTextFormat: InsertTextFormat.Snippet
                        }) satisfies CompletionItem
                );
            } else {
                const strings = requiredValues[0].values.get(alphaTab.importer.alphaTex.AlphaTexNodeType.String);
                if (strings) {
                    return strings.map(
                        i =>
                            ({
                                label: i.name,
                                sortText: `1_${i.name}`,
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
                                insertTextFormat: InsertTextFormat.Snippet
                            }) satisfies CompletionItem
                    );
                }
            }
        }
    } else if (actualValues) {
        const value = binaryNodeSearch(actualValues.values, offset);
        if (value) {
            const valueIndex = actualValues.values.indexOf(value);
            const values =
                valueIndex < expectedValues.length ? expectedValues[valueIndex].values?.get(value.nodeType) : undefined;
            if (values) {
                const kind =
                    value.nodeType === alphaTab.importer.alphaTex.AlphaTexNodeType.Ident
                        ? CompletionItemKind.EnumMember
                        : CompletionItemKind.Value;

                return values.map(
                    i =>
                        ({
                            label: i.name,
                            sortText: `1_${i.name}`,
                            kind,
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
                        }) satisfies CompletionItem
                );
            }
        }
    }

    return [];
}

function createMetaDataDocCompletions(
    metaData: Map<string, MetadataDoc>
): CompletionItemWithData<MetaDataCompletionData>[] {
    return Array.from(metaData.values()).map(d => ({
        label: d.tag,
        sortText: `3_${d.tag}`,
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
    }));
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

    const allPropCompletions: CompletionItem[] = Array.from(availableProperties.values()).map(p => ({
        label: p.property,
        sortText: `2_${p.property}`,
        kind: CompletionItemKind.Property,
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
        insertText: p.snippet,
        insertTextFormat: InsertTextFormat.Snippet
    }));

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
