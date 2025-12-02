import path from 'node:path'
import { AlphaTexExample, documentation, MetadataTagDefinition, ParameterDefinition, PropertyDefinition, SignatureDefinition, WithSignatures } from '@coderline/alphatab-language-server'
import * as alphaTab from '@coderline/alphatab'
import { FileStream, openFileStream } from './util.mjs';

export async function generateAlphaTexDocs() {
    const outPath = path.resolve(import.meta.dirname, '../docs/alphatex');
    await generateMetaDataDocs(
        path.join(outPath, '_score-metadata.mdx'),
        documentation.scoreMetaData
    )
    await generateMetaDataDocs(
        path.join(outPath, '_staff-metadata.mdx'),
        documentation.staffMetaData
    )
    await generateMetaDataDocs(
        path.join(outPath, '_structural-metadata.mdx'),
        documentation.structuralMetaData
    )
    await generateMetaDataDocs(
        path.join(outPath, '_bar-metadata.mdx'),
        documentation.barMetaData
    )

    await generatePropertiesDocs(
        path.join(outPath, '_beat-properties.mdx'),
        documentation.beatProperties
    )
    await generatePropertiesDocs(
        path.join(outPath, '_note-properties.mdx'),
        documentation.noteProperties
    )
}

async function generatePropertiesDocs(file: string, props: Map<string, PropertyDefinition>) {
    await using stream = await openFileStream(file);

    await stream.writeLine("import { AlphaTexSample } from '@site/src/components/AlphaTexSample';");
    await stream.writeLine("import { ParameterValuesTable } from '@site/src/components/ParameterValuesTable';");
    await stream.writeLine();


    for (const t of props.values()) {
        if (t.deprecated) {
            return;
        }
        await writePropertyDocs(stream, t);
    }
}

async function generateMetaDataDocs(file: string, meta: Map<string, MetadataTagDefinition>) {
    await using stream = await openFileStream(file);

    await stream.writeLine("import { AlphaTexSample } from '@site/src/components/AlphaTexSample';");
    await stream.writeLine("import { ParameterValuesTable } from '@site/src/components/ParameterValuesTable';");
    await stream.writeLine();

    for (const t of meta.values()) {
        if (t.deprecated) {
            return;
        }
        await writeMetaDataDocs(stream, t);
    }
}


async function writeMetaDataDocs(stream: FileStream, t: MetadataTagDefinition) {
    await writeWithSignatureDocs(stream, t.tag, t);

    if (t.properties) {
        await stream.writeLine(`**Properties:**`);
        await stream.writeLine();

        for (const p of t.properties.values()) {
            await writePropertyDocs(stream, p, 3);
        }
    }
}

async function writePropertyDocs(stream: FileStream, t: PropertyDefinition, level: number = 2) {
    await writeWithSignatureDocs(stream, t.property, t, level);
}


async function writeWithSignatureDocs(stream: FileStream,
    name: string,
    t: WithSignatures, level: number = 2) {
    await stream.writeLine(`${'#'.repeat(level)} \`${name}\``)
    await stream.writeLine();
    await stream.writeLine('```plain title="Syntax"');
    for (const [i, s] of t.signatures.entries()) {
        await stream.writeLine(createSignatureSyntax(
            name,
            s,
            i,
            t.signatures.length > 1
        ))
    }

    await stream.writeLine('```');
    await stream.writeLine();
    await stream.writeLine(`**Description:** ${replaceLinks(t.longDescription ?? t.shortDescription)}`);

    const hasNoParameters = t.signatures.length === 0 || (t.signatures.length === 1 && t.signatures[0].parameters.length === 0);
    if (!hasNoParameters) {
        await stream.writeLine();
        await stream.writeLine(`**Parameters:**`);
        await stream.writeLine();
        const hasOverloads = t.signatures.length > 1;
        if (hasOverloads) {
            await stream.writeLine('| Overload | Name | Description | Type | Required |')
            await stream.writeLine('|----------|------|-------------|------|----------|')
        } else {
            await stream.writeLine('| Name | Description | Type | Required |')
            await stream.writeLine('|------|-------------|------|----------|')
        }

        let withLimitations: [number, ParameterDefinition][] = [];

        for (const [si, s] of t.signatures.entries()) {
            for (const v of s.parameters) {
                const index = hasOverloads ? `\`[${si + 1}]\` | ` : '';
                let parameterDescription = v.longDescription ?? v.shortDescription;
                if (!parameterDescription && s.parameters.length === 1) {
                    parameterDescription = s.description ?? '';
                }
                parameterDescription = replaceLinks(parameterDescription).replaceAll('\n', '<br />');

                let defaultDescription = '';
                if (v.defaultValue) {
                    if (typeof v.defaultValue === 'string' && v.defaultValue.startsWith('`')) {
                        defaultDescription = v.defaultValue;
                    } else {
                        defaultDescription = '`' + v.defaultValue + '`';
                    }
                }
                await stream.writeLine(`| ${index} \`${v.name}\` | ${parameterDescription} | \`${nodeTypesToTypeDocs(v).replaceAll('|', '\\|')}\` | ${isRequiredParameter(v.parseMode) ? 'yes' : 'no'} ${replaceLinks(defaultDescription)} |`);

                if (v.values) {
                    withLimitations.push([si, v]);
                }
            }
        }

        if (withLimitations.length > 0) {
            await stream.writeLine();
            await stream.writeLine(`**Parameter Values:**`);
            await stream.writeLine();
            await stream.writeLine('Following parameters have value limitations');
            await stream.writeLine();

            const specs = withLimitations.map(p => {
                const isString = Array.isArray(p[1].type)
                    ? p[1].type[0] === alphaTab.importer.alphaTex.AlphaTexNodeType.String
                    : p[1].type === alphaTab.importer.alphaTex.AlphaTexNodeType.String;

                return p[1].values!.map(v => ([isString ? JSON.stringify(v.name) : v.name, v.shortDescription]))
            })

            if (hasOverloads) {
                await stream.writeLine('| Overload | Name | Values |')
                await stream.writeLine('|----------|------|--------|')
                for (const [i, p] of withLimitations.entries()) {
                    await stream.writeLine(`| \`[${p[0] + 1}]\` | \`${p[1].name}\` | <ParameterValuesTable values={${JSON.stringify(specs[i])}} /> |`)
                }
            } else {
                await stream.writeLine('| Name | Values |')
                await stream.writeLine('|------|--------|')
                for (const [i, p] of withLimitations.entries()) {
                    await stream.writeLine(`| \`${p[1].name}\` | <ParameterValuesTable values={${JSON.stringify(specs[i])}} /> |`)
                }
            }
        }
    }

    await stream.writeLine();
    await stream.writeLine(`**Example:**`);
    await stream.writeLine();
    if (Array.isArray(t.examples)) {
        for (const e of t.examples) {
            await writeExample(stream, e);
        }
    } else {
        await writeExample(stream, t.examples);
    }
    await stream.writeLine();
}


function createSignatureSyntax(prefix: string, value: SignatureDefinition, index: number, hasOverloads: boolean): string {
    let syntax = '';

    if (hasOverloads) {
        syntax += `// [${index + 1}]: ${value.description ?? ''}\n`;
    } else if (value.description) {
        syntax += `//  ${value.description ?? ''}\n`;
    }


    syntax += prefix;
    if (value.parameters.length === 1 && !isListType(value.parameters[0])) {
        syntax += ` ${parameterToSyntax(value.parameters[0], true)}`;
    } else {
        syntax += ` (${value.parameters.map(p => parameterToSyntax(p, true)).join(' ')})`;
    }

    return syntax;
}

function parameterToSyntax(parameter: ParameterDefinition, onlyParameterNames: boolean) {
    let p: string = parameter.name;
    if (!onlyParameterNames) {
        switch (parameter.parseMode) {
            case alphaTab.importer.alphaTex.ArgumentListParseTypesMode.Optional:
            case alphaTab.importer.alphaTex.ArgumentListParseTypesMode.OptionalAsFloat:
                p += '?';
                break;
        }
        p += `: ${nodeTypesToTypeDocs(parameter)}`;

        if (parameter.defaultValue) {
            p += ` = ${parameter.defaultValue}`;
        }
    }

    return p;
}

function nodeTypesToTypeDocs(parameter: ParameterDefinition) {
    const typeArray = Array.isArray(parameter.type) ? parameter.type : [parameter.type];
    let p: string = '';
    if (parameter.values && !parameter.valuesOnlyForCompletion && parameter.values.length < 5) {
        const valueArray = parameter.values.map(v => v.name);
        switch (typeArray[0]) {
            case alphaTab.importer.alphaTex.AlphaTexNodeType.String:
                p = valueArray.map(v => `"${v}"`).join('|');
                break;
            default:
                p = valueArray.join('|');
                break;
        }
    } else {
        p = typeArray.map(t => alphaTab.importer.alphaTex.AlphaTexNodeType[t]).join('|');
    }

    if (isListType(parameter)) {
        p += '[]';
    }

    return p;
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

async function writeExample(stream: FileStream, e: AlphaTexExample) {
    let tex: string;
    let options: alphaTab.json.SettingsJson | undefined;

    if (typeof e === 'string') {
        tex = e;
    } else {
        if (e.websiteMdx) {
            await stream.write(e.websiteMdx);
            return;
        }

        tex = e.tex;
        options = e.options;
    }

    await stream.write('<AlphaTexSample tracks="all" player={true} ');
    if (options) {
        await stream.write(`settings={${JSON.stringify(options)}}`);
    }
    await stream.writeLine('>{`');
    await stream.writeLine(tex
        // escape backslashes
        .replaceAll('\\', '\\\\')
        // escape backticks
        .replaceAll('`', '\\`')
    )
    await stream.writeLine('`}</AlphaTexSample>');
}

function isListType(parameter: ParameterDefinition) {
    switch (parameter.parseMode) {
        case alphaTab.importer.alphaTex.ArgumentListParseTypesMode.RequiredAsValueList:
        case alphaTab.importer.alphaTex.ArgumentListParseTypesMode.ValueListWithoutParenthesis:
            return true;
    }
    return false;
}

function replaceLinks(s: string | undefined) {
    return s?.replaceAll('https://next.alphatab.net/', '/')
        .replaceAll('https://alphatab.net/', '/') ?? '';
}

