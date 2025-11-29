import type * as alphaTab from '@coderline/alphatab';
import {
    allMetadata,
    beatProperties,
    durationChangeProperties,
    noteProperties
} from '@coderline/alphatab-alphatex/definitions';
import type {
    ParameterDefinition,
    PropertyDefinition,
    SignatureDefinition,
    WithSignatures
} from '@coderline/alphatab-alphatex/types';
import {
    type AlphaTexTextDocument,
    type Connection,
    ParameterInformation,
    type SignatureHelp,
    SignatureInformation,
    type TextDocuments
} from '@coderline/alphatab-language-server/server/types';
import { binaryNodeSearch, parameterToSyntax } from '@coderline/alphatab-language-server/server/utils';

export function setupSignatureHelp(connection: Connection, documents: TextDocuments<AlphaTexTextDocument>) {
    connection.onSignatureHelp(params => {
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
            return createMetaDataSignatureHelp(metaData, offset);
        }

        const beat = binaryNodeSearch(bar.beats, offset);
        if (beat) {
            return createBeatSignatureHelp(beat, offset);
        }

        return null;
    });
}

function createMetaDataSignatureHelp(
    metaData: alphaTab.importer.alphaTex.AlphaTexMetaDataNode,
    offset: number
): SignatureHelp | null {
    const metaDataDocs = allMetadata.get(`\\${metaData.tag.tag.text.toLowerCase()}`);
    if (!metaDataDocs) {
        return null;
    }

    const endOfValues = metaData.arguments?.end!.offset ?? metaData.properties?.start!.offset ?? metaData.end!.offset;
    if (metaData.start!.offset <= offset && offset < endOfValues) {
        return createArgumentsSignatureHelp(`\\${metaData.tag.tag.text}`, metaDataDocs, metaData.arguments, offset);
    }

    if (metaData.properties && metaDataDocs.properties) {
        const help = createPropertiesSignatureHelp(metaData.properties, metaDataDocs.properties, offset);
        if (help != null) {
            return help;
        }
    }

    return null;
}

function createBeatSignatureHelp(
    beat: alphaTab.importer.alphaTex.AlphaTexBeatNode,
    offset: number
): SignatureHelp | null {
    if (beat.durationChange?.properties) {
        const hover = createPropertiesSignatureHelp(beat.durationChange.properties, durationChangeProperties, offset);
        if (hover != null) {
            return hover;
        }
    }

    if (beat.notes) {
        const note = binaryNodeSearch(beat.notes.notes, offset);
        if (note) {
            return createNoteSignatureHelp(note, offset);
        }
    }

    if (beat.beatEffects) {
        const hover = createPropertiesSignatureHelp(beat.beatEffects, beatProperties, offset);
        if (hover != null) {
            return hover;
        }
    }

    return null;
}

function createNoteSignatureHelp(
    note: alphaTab.importer.alphaTex.AlphaTexNoteNode,
    offset: number
): SignatureHelp | null {
    if (note?.noteEffects) {
        const hover = createPropertiesSignatureHelp(note.noteEffects, [noteProperties, beatProperties], offset);
        if (hover != null) {
            return hover;
        }
    }

    return null;
}

function createPropertiesSignatureHelp(
    properties: alphaTab.importer.alphaTex.AlphaTexPropertiesNode,
    propertiesDocs: Map<string, PropertyDefinition> | Map<string, PropertyDefinition>[],
    offset: number
): SignatureHelp | null {
    const prop = binaryNodeSearch(properties.properties, offset);
    if (!prop) {
        return null;
    }

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
        return createArgumentsSignatureHelp(prop.property.text, propDocs, prop.arguments, offset);
    }

    return null;
}

function createArgumentsSignatureHelp(
    parentItemLabel: string,
    docs: WithSignatures,
    values: alphaTab.importer.alphaTex.AlphaTexArgumentList | undefined,
    offset: number
): SignatureHelp | null {
    const help: SignatureHelp = {
        signatures: docs.signatures.map(s => signatureDefinitionToHelp(parentItemLabel, docs, s)),
        activeSignature: undefined,
        activeParameter: undefined
    };

    if (!values) {
        return help;
    }

    help.activeSignature = values.matchedSignatureIndex;
    if (values.matchedSignatureIndex !== undefined) {
        const value = binaryNodeSearch(values.arguments, offset);
        if (value) {
            if (value.parameterIndices !== undefined) {
                for (let i = 0; i < value.parameterIndices.length; i++) {
                    const parameterIndex = value.parameterIndices[i];
                    if (parameterIndex >= 0) {
                        help.signatures[i].activeParameter = parameterIndex;
                    }
                }
            }
        }
    }

    return help;
}

function createParameterInfo(signature: SignatureInformation, doc: ParameterDefinition) {
    const start = signature.label.length;
    signature.label += parameterToSyntax(doc);

    const end = signature.label.length;
    signature.parameters!.push(ParameterInformation.create([start, end], doc.longDescription ?? doc.shortDescription));
}

function signatureDefinitionToHelp(
    label: string,
    docs: WithSignatures,
    signature: SignatureDefinition
): SignatureInformation {
    const signatureDocs = SignatureInformation.create(`${label} `, docs.longDescription ?? docs.shortDescription);

    signatureDocs.label += ' (';
    for (let i = 0; i < signature.parameters.length; i++) {
        if (i > 0) {
            signatureDocs.label += ' ';
        }
        createParameterInfo(signatureDocs, signature.parameters[i]);
    }

    signatureDocs.label += ')';
    return signatureDocs;
}
