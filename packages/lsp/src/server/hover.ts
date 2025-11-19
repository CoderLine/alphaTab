import * as alphaTab from '@coderline/alphatab';
import {
    allMetadata,
    beatProperties,
    durationChangeProperties,
    noteProperties
} from '@coderline/alphatab-lsp/documentation/documentation';
import type { CommonDoc, PropertyDoc, ValueDoc, ValueItemDoc } from '@coderline/alphatab-lsp/documentation/types';
import type { AlphaTexTextDocument, Connection, Hover, TextDocuments } from '@coderline/alphatab-lsp/server/types';
import { binaryNodeSearch } from '@coderline/alphatab-lsp/server/utils';

export function setupHover(connection: Connection, documents: TextDocuments<AlphaTexTextDocument>) {
    connection.onHover(params => {
        const document = documents.get(params.textDocument.uri);
        if (!document?.ast) {
            return null;
        }

        const offset = document.offsetAt(params.position);

        // lookup bar at location
        const bar = binaryNodeSearch(document.ast.bars, offset);
        if (!bar) {
            return null;
        }

        const metaData = binaryNodeSearch(bar.metaData, offset);
        if (metaData) {
            return createMetaDataHover(metaData, offset);
        }

        const beat = binaryNodeSearch(bar.beats, offset);
        if (beat) {
            return createBeatHover(beat, offset);
        }

        return null;
    });
}

function createMetaDataHover(metaData: alphaTab.importer.alphaTex.AlphaTexMetaDataNode, offset: number): Hover | null {
    const metaDataDocs = allMetadata.get(`\\${metaData.tag.tag.text.toLowerCase()}`);
    if (!metaDataDocs) {
        return null;
    }

    if (metaData.tag.start!.offset <= offset && offset <= metaData.tag.end!.offset) {
        return {
            contents: {
                kind: 'markdown',
                value: commonDocsToMarkdown(metaDataDocs, 'Tag Syntax')
            }
        };
    }

    if (metaData.values) {
        const hover = createValuesHover(metaData.values, metaDataDocs.values, offset);
        if (hover != null) {
            return hover;
        }
    }

    if (metaData.properties && metaDataDocs.properties) {
        const hover = createPropertiesHover(metaData.properties, metaDataDocs.properties, offset);
        if (hover != null) {
            return hover;
        }
    }

    return null;
}

function createBeatHover(beat: alphaTab.importer.alphaTex.AlphaTexBeatNode, offset: number): Hover | null {
    if (beat.durationChange?.properties) {
        const hover = createPropertiesHover(beat.durationChange.properties, durationChangeProperties, offset);
        if (hover != null) {
            return hover;
        }
    }

    if (beat.notes) {
        const note = binaryNodeSearch(beat.notes.notes, offset);
        if (note) {
            return createNoteHover(note, offset);
        }
    }

    if (beat.beatEffects) {
        const hover = createPropertiesHover(beat.beatEffects, beatProperties, offset);
        if (hover != null) {
            return hover;
        }
    }

    return null;
}

function createNoteHover(note: alphaTab.importer.alphaTex.AlphaTexNoteNode, offset: number): Hover | null {
    if (note?.noteEffects) {
        const hover = createPropertiesHover(note.noteEffects, [noteProperties, beatProperties], offset);
        if (hover != null) {
            return hover;
        }
    }

    return null;
}

function createPropertiesHover(
    properties: alphaTab.importer.alphaTex.AlphaTexPropertiesNode,
    propertiesDocs: Map<string, PropertyDoc> | Map<string, PropertyDoc>[],
    offset: number
): Hover | null {
    const prop = binaryNodeSearch(properties.properties, offset);
    if (prop) {
        let propDocs: PropertyDoc | undefined;
        if (Array.isArray(propertiesDocs)) {
            for (const d of propertiesDocs) {
                propDocs = d.get(prop.property.text.toLowerCase());
                if (propDocs) {
                    break;
                }
            }
        } else {
            propDocs = propertiesDocs.get(prop.property.text.toLowerCase());
        }

        if (propDocs) {
            if (prop.property.start!.offset <= offset && offset <= prop.property.end!.offset) {
                return {
                    contents: {
                        kind: 'markdown',
                        value: commonDocsToMarkdown(propDocs)
                    }
                };
            } else if (prop.values) {
                const hover = createValuesHover(prop.values, propDocs.values, offset);
                if (hover) {
                    return hover;
                }
            }
        }
    }
    return null;
}

function valueToText(value: alphaTab.importer.alphaTex.IAlphaTexValueListItem): string {
    switch (value.nodeType) {
        case alphaTab.importer.alphaTex.AlphaTexNodeType.Ident:
        case alphaTab.importer.alphaTex.AlphaTexNodeType.String:
            return (value as alphaTab.importer.alphaTex.AlphaTexTextNode).text;
        case alphaTab.importer.alphaTex.AlphaTexNodeType.Number:
            return (value as alphaTab.importer.alphaTex.AlphaTexNumberLiteral).value.toString();
    }

    return '';
}

function createValuesHover(
    values: alphaTab.importer.alphaTex.AlphaTexValueList,
    valueDocs: ValueDoc[],
    offset: number
): Hover | null {
    const value = binaryNodeSearch(values.values, offset);
    if (value) {
        const valueIndex = values.values.indexOf(value);
        if (valueIndex < valueDocs.length) {
            const valueDoc = valueDocs[valueIndex];
            const valueText = valueToText(value).toLowerCase();
            const valueItem = valueDoc.values?.get(value.nodeType)?.find(d => d.name.toLowerCase() === valueText);
            if (valueItem) {
                return {
                    contents: {
                        kind: 'markdown',
                        value: valueItemDocsToMarkDown(valueItem)
                    }
                };
            }
        }
    }
    return null;
}

function commonDocsToMarkdown(docs: CommonDoc, syntaxName: string = 'Syntax'): string {
    return [
        `## ${docs.shortDescription}`,
        docs.longDescription ? `**Description:** ${docs.longDescription}` : '',
        '',
        `**${syntaxName}:**`,
        '```alphatex',
        ...docs.syntax,
        '```',
        '',
        valueDocsToMarkdownTable(docs.values)
    ].join('\n');
}

function valueDocsToMarkdownTable(values: ValueDoc[]): string {
    return values.length === 0
        ? ''
        : [
              '',
              '**Values:**',
              '| Name | Description | Type | Required |',
              '|------|-------------|------|----------|',
              ...values.map(
                  v =>
                      `| \`${v.name}\` | ${(v.longDescription ?? v.shortDescription)?.replaceAll('\n', '<br />') ?? ''} | ${v.type} | ${v.required ? 'yes' : 'no'} ${v.defaultValue ?? ''} |`
              )
          ].join('\n');
}

function valueItemDocsToMarkDown(docs: ValueItemDoc): string {
    return [`## ${docs.name}`, docs.longDescription ?? docs.shortDescription, ''].join('\n');
}
