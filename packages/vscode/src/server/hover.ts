import type * as alphaTab from '@src/alphaTab.main';
import { allMetadata, beatProperties, durationChangeProperties, noteProperties } from 'src/documentation/documentation';
import type { MetadataDoc, PropertyDoc } from 'src/documentation/types';
import type { AlphaTexTextDocument, Connection } from 'src/server/types';
import { binaryNodeSearch } from 'src/server/utils';
import type { TextDocuments } from 'vscode-languageserver';
import type { Hover } from 'vscode-languageserver/lib/node/main';

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

function createNoteHover(note: alphaTab.importer.alphaTex.AlphaTexNoteNode, offset: number): Hover | null {
    if (note?.noteEffects) {
        const prop = binaryNodeSearch(note.noteEffects.properties, offset);
        if (prop && prop.property.start!.offset <= offset && offset <= prop.property.end!.offset) {
            const propDocs = noteProperties.get(prop.property.text.toLowerCase());
            if (propDocs) {
                return {
                    contents: {
                        kind: 'markdown',
                        value: propertyDocsToMarkdown(propDocs)
                    }
                };
            } else {
                return null;
            }
        }
    }

    return null;
}

function createBeatHover(beat: alphaTab.importer.alphaTex.AlphaTexBeatNode, offset: number): Hover | null {
    if (beat.durationChange?.properties) {
        const prop = binaryNodeSearch(beat.durationChange.properties.properties, offset);
        if (prop && prop.property.start!.offset <= offset && offset <= prop.property.end!.offset) {
            const propDocs = durationChangeProperties.get(prop.property.text.toLowerCase());
            if (propDocs) {
                return {
                    contents: {
                        kind: 'markdown',
                        value: propertyDocsToMarkdown(propDocs)
                    }
                };
            } else {
                return null;
            }
        }
    }

    if (beat.notes) {
        const note = binaryNodeSearch(beat.notes.notes, offset);
        if (note) {
            return createNoteHover(note, offset);
        }
    }

    if (beat.beatEffects) {
        const prop = binaryNodeSearch(beat.beatEffects.properties, offset);
        if (prop && prop.property.start!.offset <= offset && offset <= prop.property.end!.offset) {
            const propDocs = beatProperties.get(prop.property.text.toLowerCase());
            if (propDocs) {
                return {
                    contents: {
                        kind: 'markdown',
                        value: propertyDocsToMarkdown(propDocs)
                    }
                };
            } else {
                return null;
            }
        }
    }

    return null;
}

function createMetaDataHover(metaData: alphaTab.importer.alphaTex.AlphaTexMetaDataNode, offset: number): Hover | null {
    if (metaData.tag.start!.offset <= offset && offset <= metaData.tag.end!.offset) {
        const metaDataDocs = allMetadata.get(`\\${metaData.tag.tag.text.toLowerCase()}`);
        if (metaDataDocs) {
            return {
                contents: {
                    kind: 'markdown',
                    value: metaDataDocsToMarkdown(metaDataDocs)
                }
            };
        }
    }

    if (metaData.properties) {
        const prop = binaryNodeSearch(metaData.properties.properties, offset);
        if (prop && prop.property.start!.offset <= offset && offset <= prop.property.end!.offset) {
            const metaDataDocs = allMetadata.get(`\\${metaData.tag.tag.text.toLowerCase()}`);
            if (!metaDataDocs) {
                return null;
            }

            const propDocs = metaDataDocs.properties?.get(prop.property.text.toLowerCase());
            if (propDocs) {
                return {
                    contents: {
                        kind: 'markdown',
                        value: propertyDocsToMarkdown(propDocs)
                    }
                };
            }
        }
    }

    return null;
}

function propertyDocsToMarkdown(propDocs: PropertyDoc): string {
    return [
        '```alphatex title=Syntax',
        ...propDocs.syntax,
        '```',
        '',
        `**Description:** ${propDocs.description}`,
        ...(propDocs.values.length === 0
            ? []
            : [
                  '',
                  '**Values:**',
                  '| Name | Description | Type | Required |',
                  '|------|-------------|------|----------|',
                  ...propDocs.values.map(
                      v =>
                          `| \`${v.name}\` | ${v.description?.replaceAll('\n', '<br />') ?? ''} | ${v.type} | ${v.required ? 'yes' : 'no'} ${v.defaultValue ?? ''} |`
                  )
              ])
    ].join('\n');
}

function metaDataDocsToMarkdown(metaDataDocs: MetadataDoc): string {
    return [
        '```alphatex title=Tag Syntax',
        ...metaDataDocs.syntax,
        '```',
        '',
        `**Description:** ${metaDataDocs.description}`,
        ...(metaDataDocs.values.length === 0
            ? []
            : [
                  '',
                  '**Values:**',
                  '| Name | Description | Type | Required |',
                  '|------|-------------|------|----------|',
                  ...metaDataDocs.values.map(
                      v =>
                          `| \`${v.name}\` | ${v.description?.replaceAll('\n', '<br />') ?? ''} | ${v.type} | ${v.required ? 'yes' : 'no'} ${v.defaultValue ?? ''} |`
                  )
              ])
    ].join('\n');
}
