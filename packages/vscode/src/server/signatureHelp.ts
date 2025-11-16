import type * as alphaTab from '@src/alphaTab.main';
import { allMetadata, beatProperties, durationChangeProperties, noteProperties } from 'src/documentation/documentation';
import type { CommonDoc, PropertyDoc, ValueDoc } from 'src/documentation/types';
import type { AlphaTexTextDocument, Connection } from 'src/server/types';
import { binaryNodeSearch } from 'src/server/utils';
import {
    ParameterInformation,
    SignatureInformation,
    type SignatureHelp,
    type TextDocuments
} from 'vscode-languageserver';

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

    const endOfValues = metaData.values?.end!.offset ?? metaData.properties?.start!.offset ?? metaData.end!.offset;
    if (metaData.start!.offset <= offset && offset < endOfValues) {
        return createValuesSignatureHelp(`\\${metaData.tag.tag.text}`, metaDataDocs, metaData.values, offset);
    }

    if (metaData.properties && metaDataDocs.properties) {
        const hover = createPropertiesSignatureHelp(metaData.properties, metaDataDocs.properties, offset);
        if (hover != null) {
            return hover;
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
    propertiesDocs: Map<string, PropertyDoc> | Map<string, PropertyDoc>[],
    offset: number
): SignatureHelp | null {
    const prop = binaryNodeSearch(properties.properties, offset);
    if (!prop) {
        return null;
    }

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
        return createValuesSignatureHelp(prop.property.text, propDocs, prop.values, offset);
    }

    return null;
}

function createValuesSignatureHelp(
    parentItemLabel: string,
    docs: { values: ValueDoc[] } & CommonDoc,
    values: alphaTab.importer.alphaTex.AlphaTexValueList | undefined,
    offset: number
): SignatureHelp | null {
    const help: SignatureHelp = {
        signatures: [],
        activeSignature: undefined,
        activeParameter: undefined
    };

    if (docs.values.length === 0) {
        help.signatures.push(
            SignatureInformation.create(parentItemLabel, docs.longDescription ?? docs.shortDescription)
        );
        return help;
    }

    // \track name
    const requiredValues = docs.values.filter(d => d.required);
    if (requiredValues.length < 2 && !docs.values[0].isList) {
        const signature = SignatureInformation.create(
            `${parentItemLabel} `,
            docs.longDescription ?? docs.shortDescription
        );
        createParameterInfo(signature, docs.values[0]);
        help.signatures.push(signature);
    }

    if (docs.values.length > 1 || docs.values[0].isList) {
        // \title (fullName shortName)
        const signature = SignatureInformation.create(parentItemLabel, docs.longDescription ?? docs.shortDescription);
        signature.label += ' (';
        for (let i = 0; i < docs.values.length; i++) {
            if (i > 0) {
                signature.label += ' ';
            }
            createParameterInfo(signature, docs.values[i]);
        }
        
        signature.label += ')';
        help.signatures.push(signature);
    }

    if (values) {
        if (values.openParenthesis && help.signatures.length > 1) {
            help.activeSignature = 1;
        } else {
            help.activeSignature = 0;
        }

        const value = binaryNodeSearch(values.values, offset);
        if (value) {
            const valueIndex = values.values.indexOf(value);
            if (valueIndex < docs.values.length) {
                help.activeParameter = valueIndex;
            } else {
                help.activeParameter = docs.values.length - 1;
            }
        }
    }

    return help;
}

function createParameterInfo(signature: SignatureInformation, doc: ValueDoc) {
    const start = signature.label.length;
    signature.label += doc.name;
    const end = signature.label.length;
    signature.parameters!.push(ParameterInformation.create([start, end], doc.longDescription ?? doc.shortDescription));
}
