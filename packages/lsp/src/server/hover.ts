import * as alphaTab from '@coderline/alphatab';
import {
    allMetadata,
    beatProperties,
    durationChangeProperties,
    noteProperties
} from '@coderline/alphatab-alphatex/definitions';
import type {
    ParameterValueDefinition,
    PropertyDefinition,
    SignatureDefinition,
    WithSignatures
} from '@coderline/alphatab-alphatex/types';
import type {
    AlphaTexTextDocument,
    Connection,
    Hover,
    TextDocuments
} from '@coderline/alphatab-language-server/server/types';
import {
    binaryNodeSearch,
    nodeTypesToTypeDocs as nodeTypesToSyntax,
    parameterToSyntax,
    resolveSignature
} from '@coderline/alphatab-language-server/server/utils';

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
                value: withSignaturesToMarkdown(metaDataDocs, metaDataDocs.tag, 'Tag Syntax')
            }
        };
    }

    if (metaData.arguments) {
        const hover = createArgumentsHover(metaData.arguments, metaDataDocs.signatures, offset);
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
    propertiesDocs: Map<string, PropertyDefinition> | Map<string, PropertyDefinition>[],
    offset: number
): Hover | null {
    const prop = binaryNodeSearch(properties.properties, offset);
    if (prop) {
        let propDocs: PropertyDefinition | undefined;
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
                        value: withSignaturesToMarkdown(propDocs, propDocs.property)
                    }
                };
            } else if (prop.arguments) {
                const hover = createArgumentsHover(prop.arguments, propDocs.signatures, offset);
                if (hover) {
                    return hover;
                }
            }
        }
    }
    return null;
}

function valueToText(value: alphaTab.importer.alphaTex.IAlphaTexArgumentValue): string {
    switch (value.nodeType) {
        case alphaTab.importer.alphaTex.AlphaTexNodeType.Ident:
        case alphaTab.importer.alphaTex.AlphaTexNodeType.String:
            return (value as alphaTab.importer.alphaTex.AlphaTexTextNode).text;
        case alphaTab.importer.alphaTex.AlphaTexNodeType.Number:
            return (value as alphaTab.importer.alphaTex.AlphaTexNumberLiteral).value.toString();
    }

    return '';
}

function createArgumentsHover(
    values: alphaTab.importer.alphaTex.AlphaTexArgumentList,
    signatures: SignatureDefinition[],
    offset: number
): Hover | null {
    const value = binaryNodeSearch(values.arguments, offset);
    if (value) {
        const valueIndex = values.arguments.indexOf(value);
        const signature = resolveSignature(signatures, values).values().next().value;
        if (signature && valueIndex < signature.parameters.length) {
            const parameterDoc = signature.parameters[valueIndex];
            const valueText = valueToText(value).toLowerCase();
            const valueItem = parameterDoc.values?.find(d => d.name.toLowerCase() === valueText);
            if (valueItem) {
                return {
                    contents: {
                        kind: 'markdown',
                        value: parameterValueDocsToMarkDown(valueItem)
                    }
                };
            }
        }
    }
    return null;
}

function withSignaturesToMarkdown(docs: WithSignatures, prefix: string, syntaxName: string = 'Syntax'): string {
    return [
        `## ${docs.shortDescription}`,
        docs.longDescription ? `**Description:** ${docs.longDescription}` : '',
        '',
        `**${syntaxName}:**`,
        '```alphatex',
        ...docs.signatures.map((s, i) => signatureToSyntax(prefix, s, i, docs.signatures.length > 1)),
        '```',
        '',
        signatureParametersToMarkdownTable(docs.signatures)
    ].join('\n');
}

function signatureParametersToMarkdownTable(signatures: SignatureDefinition[]): string {
    if (signatures.length === 0 || (signatures.length === 1 && signatures[0].parameters.length === 0)) {
        return '';
    }

    const hasOverloads = signatures.length > 1;
    if (hasOverloads) {
        return [
            '',
            '**Parameters:**',
            '| Overload | Name | Description | Type | Required |',
            '|----------|------|-------------|------|----------|',
            ...signatures.flatMap((s, si) =>
                s.parameters.map(v => {
                    return `| \`[${si + 1}]\` | \`${v.name}\` | ${(v.longDescription ?? v.shortDescription)?.replaceAll('\n', '<br />') ?? ''} | \`${nodeTypesToSyntax(v).replaceAll('|', '\\|')}\` | ${isRequiredParameter(v.parseMode) ? 'yes' : 'no'} ${v.defaultValue ?? ''} |`;
                })
            )
        ].join('\n');
    } else {
        return [
            '',
            '**Parameters:**',
            '| Name | Description | Type | Required |',
            '|------|-------------|------|----------|',
            ...signatures.flatMap(s =>
                s.parameters.map(v => {
                    return `| \`${v.name}\` | ${(v.longDescription ?? v.shortDescription)?.replaceAll('\n', '<br />') ?? ''} | \`${nodeTypesToSyntax(v).replaceAll('|', '\\|')}\` | ${isRequiredParameter(v.parseMode) ? 'yes' : 'no'} ${v.defaultValue ?? ''} |`;
                })
            )
        ].join('\n');
    }
}

function parameterValueDocsToMarkDown(docs: ParameterValueDefinition): string {
    return [`## ${docs.name}`, docs.longDescription ?? docs.shortDescription, ''].join('\n');
}

function signatureToSyntax(prefix: string, value: SignatureDefinition, index: number, hasOverloads: boolean): string {
    let syntax = '';

    if (hasOverloads) {
        syntax += `// [${index + 1}]: ${value.description ?? ''}\n`;
    } else if (value.description) {
        syntax += `//  ${value.description}\n`;
    }

    syntax += prefix;
    if (value.parameters.length > 0) {
        syntax += `(${value.parameters.map(p => parameterToSyntax(p, true)).join(' ')})`;
    }

    return syntax;
}

function isRequiredParameter(parseMode: alphaTab.importer.alphaTex.ArgumentListParseTypesMode) {
    switch (parseMode) {
        case alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Required:
        case alphaTab.importer.alphaTex.ArgumentListParseTypesMode.RequiredAsFloat:
        case alphaTab.importer.alphaTex.ArgumentListParseTypesMode.RequiredAsValueList:
            return true;
        default:
            return false;
    }
}
