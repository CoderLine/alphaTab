import path from 'node:path'
import url from 'node:url'
import fs from 'node:fs/promises'
import { AlphaTexExample, documentation, MetadataTagDefinition, ParameterDefinition, PropertyDefinition, SignatureDefinition, WithSignatures } from '@coderline/alphatab-language-server'
import * as alphaTab from '@coderline/alphatab'
import { FileStream, openFileStream, rewriteLegacyDocLinks } from './util.mjs';

interface Scope {
    label: string;
    anchor: string;
}

const SCOPE_SCORE_METADATA: Scope = { label: 'Score metadata', anchor: 'score-metadata' };
const SCOPE_STAFF_METADATA: Scope = { label: 'Staff metadata', anchor: 'staff-metadata' };
const SCOPE_STRUCTURAL_METADATA: Scope = { label: 'Structural metadata', anchor: 'structural-metadata' };
const SCOPE_BAR_METADATA: Scope = { label: 'Bar metadata', anchor: 'bar-metadata' };
const SCOPE_BEAT_PROPERTY: Scope = { label: 'Beat property', anchor: 'beat-property' };
const SCOPE_NOTE_PROPERTY: Scope = { label: 'Note property', anchor: 'note-property' };

export async function generateAlphaTexDocs() {
    const outPath = path.resolve(import.meta.dirname, '../docs/alphatex');
    await generateMetaDataDocs(
        path.join(outPath, '_score-metadata.mdx'),
        documentation.scoreMetaData,
        SCOPE_SCORE_METADATA
    )
    await generateMetaDataDocs(
        path.join(outPath, '_staff-metadata.mdx'),
        documentation.staffMetaData,
        SCOPE_STAFF_METADATA
    )
    await generateMetaDataDocs(
        path.join(outPath, '_structural-metadata.mdx'),
        documentation.structuralMetaData,
        SCOPE_STRUCTURAL_METADATA
    )
    await generateMetaDataDocs(
        path.join(outPath, '_bar-metadata.mdx'),
        documentation.barMetaData,
        SCOPE_BAR_METADATA
    )

    await generatePropertiesDocs(
        path.join(outPath, '_beat-properties.mdx'),
        documentation.beatProperties,
        SCOPE_BEAT_PROPERTY
    )
    await generatePropertiesDocs(
        path.join(outPath, '_note-properties.mdx'),
        documentation.noteProperties,
        SCOPE_NOTE_PROPERTY
    )

    await generateTroubleshootingPage(
        path.join(outPath, '_troubleshooting.mdx')
    );
}

interface DiagnosticEntry {
    name: string;
    code: number;
    description: string;
}

interface DiagnosticCategory {
    id: string;
    heading: string;
    intro: string;
    severity: string;
    from: number;
    to: number;
    entries: DiagnosticEntry[];
}

/**
 * Reads the AlphaTexDiagnosticCode enum from the shipped `@coderline/alphatab`
 * `.d.ts` (the enum ships as `declare const enum`-adjacent and is not on the
 * runtime module surface). Emits the generated troubleshooting partial
 * grouped by AT-code ranges, sorted by number within each group.
 */
async function generateTroubleshootingPage(file: string) {
    const alphaTabEntry = url.fileURLToPath(
        import.meta.resolve('@coderline/alphatab')
    );
    const dtsPath = path.resolve(alphaTabEntry, '..', 'alphaTab.d.ts');
    const dts = await fs.readFile(dtsPath, 'utf8');

    const entries = parseDiagnosticEnum(dts);

    const categories: DiagnosticCategory[] = [
        {
            id: 'writing-errors',
            heading: 'Writing errors',
            severity: 'Error (Lexer)',
            from: 1,
            to: 199,
            intro:
                "These fire while alphaTab is still reading the raw characters of your file — before it even starts making sense of bars and notes. If your quote is unclosed or an escape sequence is malformed, you land here.",
            entries: [],
        },
        {
            id: 'structural-errors',
            heading: 'Structural errors',
            severity: 'Error (Parser)',
            from: 200,
            to: 299,
            intro:
                "The characters read fine, but the shape of your file does not. Missing values, unclosed groups, notes that do not fit the staff kind, arguments that do not match any known signature — all show up here.",
            entries: [],
        },
        {
            id: 'legacy-syntax-hints',
            heading: 'Legacy syntax hints',
            // Codes 300–399 surface as Warning; 400–499 surface as Hint.
            // Both point at pre-1.7 forms and misplaced constructs, so they
            // share a category; the per-code Severity line distinguishes them.
            severity: '',
            from: 300,
            to: 499,
            intro:
                "Your file parses, but you are using a form that pre-dates alphaTex 1.7 or leaves redundant separators in place. alphaTab still accepts these; upgrading brings your notation in line with the current shape and unlocks better editor tooling.",
            entries: [],
        },
    ];

    for (const entry of entries) {
        const bucket = categories.find(c => entry.code >= c.from && entry.code <= c.to);
        if (!bucket) {
            throw new Error(
                `AlphaTexDiagnosticCode ${entry.name} (=${entry.code}) does not fall into any known range. ` +
                'Update generateTroubleshootingPage() in scripts/generate-alphatex.mts.'
            );
        }
        bucket.entries.push(entry);
    }

    for (const category of categories) {
        category.entries.sort((a, b) => a.code - b.code);
    }

    await using stream = await openFileStream(file);

    await stream.writeLine('{/* Generated from AlphaTexDiagnosticCode in @coderline/alphatab. Do not edit by hand — regenerate with `npm run generate-alphatabdoc`. Musician-facing enrichments live in _troubleshooting-extras.mdx. */}');
    await stream.writeLine();

    for (const category of categories) {
        if (category.entries.length === 0) {
            continue;
        }

        await stream.writeLine(`## ${category.heading} {#${category.id}}`);
        await stream.writeLine();
        await stream.writeLine(category.intro);
        await stream.writeLine();

        for (const entry of category.entries) {
            const severity = category.severity || severityForCode(entry.code);
            await writeDiagnosticEntry(stream, entry, severity);
        }
    }
}

function severityForCode(code: number): string {
    if (code < 100) {
        return 'Error (Lexer)';
    }
    if (code < 200) {
        return 'Warning (Lexer)';
    }
    if (code < 300) {
        return 'Error (Parser)';
    }
    if (code < 400) {
        return 'Warning';
    }
    return 'Hint';
}

async function writeDiagnosticEntry(stream: FileStream, entry: DiagnosticEntry, severity: string) {
    const anchor = entry.name.toLowerCase();
    const headline = formatDiagnosticHeadline(entry.description);

    await stream.writeLine(`### ${entry.name} — ${headline} {#${anchor}}`);
    await stream.writeLine();
    await stream.writeLine(`**Severity:** ${severity}`);
    await stream.writeLine();

    if (entry.description) {
        await stream.writeLine(`**Parser message:** ${escapeMdx(entry.description)}`);
    } else {
        await stream.writeLine('**Parser message:** _(no TSDoc supplied — see the extras partial for details)_');
    }
    await stream.writeLine();
}

/**
 * Distills a musician-facing headline from the parser's raw message template.
 * Strips `%s` placeholders, collapses whitespace, and truncates to fit in a
 * heading. The full templated message is emitted separately as "Parser message".
 */
function formatDiagnosticHeadline(description: string): string {
    if (!description) {
        return 'Diagnostic';
    }
    let text = description
        .replace(/%s/g, 'value')
        .replace(/\s+/g, ' ')
        .trim();
    // Cut at the first sentence end so the heading stays short; dots inside syntax like `fret.string` do not end a sentence.
    const stop = text.search(/[.!?](?=\s|$)/);
    if (stop >= 0) {
        text = text.slice(0, stop);
    }
    if (text.length > 90) {
        const cut = text.lastIndexOf(' ', 87);
        text = text.slice(0, cut > 0 ? cut : 87).replace(/[\s,;:]+$/, '') + '...';
    }
    return text;
}

/**
 * MDX passes most Markdown through, but curly braces are treated as JSX.
 * Escape any that survive from the parser messages.
 */
function escapeMdx(s: string): string {
    return s.replace(/\{/g, '\\{').replace(/\}/g, '\\}');
}

/**
 * Scans the shipped `.d.ts` for the AlphaTexDiagnosticCode enum, capturing
 * each member's TSDoc and numeric value. Uses regex on the NPM artefact —
 * the enum is not on the runtime module surface (it ships inside the
 * `alphaTex` namespace declaration and is stripped from `alphaTab.mjs`).
 */
function parseDiagnosticEnum(dts: string): DiagnosticEntry[] {
    const enumStart = dts.indexOf('declare enum AlphaTexDiagnosticCode {');
    if (enumStart < 0) {
        throw new Error('Could not find AlphaTexDiagnosticCode enum in alphaTab.d.ts');
    }
    const bodyStart = dts.indexOf('{', enumStart) + 1;
    const bodyEnd = dts.indexOf('}', bodyStart);
    if (bodyEnd < 0) {
        throw new Error('AlphaTexDiagnosticCode enum body not terminated in alphaTab.d.ts');
    }
    const body = dts.slice(bodyStart, bodyEnd);

    // First pass: find every enum member and its position.
    const memberRegex = /(AT\d+)\s*=\s*(\d+)/g;
    const members: { name: string; code: number; index: number }[] = [];
    for (const match of body.matchAll(memberRegex)) {
        members.push({
            name: match[1],
            code: Number.parseInt(match[2], 10),
            index: match.index!,
        });
    }

    if (members.length === 0) {
        throw new Error('AlphaTexDiagnosticCode enum appears to be empty — parser likely misaligned.');
    }

    // Second pass: attach the nearest preceding TSDoc block to each member.
    const entries: DiagnosticEntry[] = [];
    for (let i = 0; i < members.length; i++) {
        const member = members[i];
        const previousEnd = i === 0 ? 0 : members[i - 1].index + members[i - 1].name.length;
        const preamble = body.slice(previousEnd, member.index);
        const tsdocMatch = preamble.match(/\/\*\*([\s\S]*?)\*\/\s*$/);
        entries.push({
            name: member.name,
            code: member.code,
            description: tsdocMatch ? cleanTsDoc(tsdocMatch[1]) : '',
        });
    }

    return entries;
}

function cleanTsDoc(raw: string): string {
    return raw
        .split('\n')
        .map(line => line.replace(/^\s*\*\s?/, ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
}

async function generatePropertiesDocs(file: string, props: Map<string, PropertyDefinition>, scope: Scope) {
    await using stream = await openFileStream(file);

    await stream.writeLine("import { AlphaTexSample } from '@site/src/components/AlphaTexSample';");
    await stream.writeLine("import { ParameterValuesTable } from '@site/src/components/ParameterValuesTable';");
    await stream.writeLine();


    for (const t of props.values()) {
        if (t.deprecated) {
            continue;
        }
        await writePropertyDocs(stream, t, scope);
    }
}

async function generateMetaDataDocs(file: string, meta: Map<string, MetadataTagDefinition>, scope: Scope) {
    await using stream = await openFileStream(file);

    await stream.writeLine("import { AlphaTexSample } from '@site/src/components/AlphaTexSample';");
    await stream.writeLine("import { ParameterValuesTable } from '@site/src/components/ParameterValuesTable';");
    await stream.writeLine();

    for (const t of meta.values()) {
        if (t.deprecated) {
            continue;
        }
        await writeMetaDataDocs(stream, t, scope);
    }
}


async function writeMetaDataDocs(stream: FileStream, t: MetadataTagDefinition, scope: Scope) {
    await writeWithSignatureDocs(stream, t.tag, t, scope);

    if (t.properties) {
        await stream.writeLine(`**Properties:**`);
        await stream.writeLine();

        for (const p of t.properties.values()) {
            await writePropertyDocs(stream, p, scope, 3);
        }
    }
}

async function writePropertyDocs(stream: FileStream, t: PropertyDefinition, scope: Scope, level: number = 2) {
    await writeWithSignatureDocs(stream, t.property, t, scope, level);
}


async function writeWithSignatureDocs(stream: FileStream,
    name: string,
    t: WithSignatures, scope: Scope, level: number = 2) {
    await stream.writeLine(`${'#'.repeat(level)} \`${name}\``)
    await stream.writeLine();
    await stream.writeLine(`**Scope:** [${scope.label}](./syntax#${scope.anchor})`);
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
    return rewriteLegacyDocLinks(s?.replaceAll('https://next.alphatab.net/', '/')
        .replaceAll('https://alphatab.net/', '/') ?? '');
}

