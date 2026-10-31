import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { Extractor, ExtractorConfig, type ExtractorResult } from '@microsoft/api-extractor';

// Internal API of API Extractor; the version is pinned in package.json and every declared external
// must be seen by this hook, so a changed internal fails the build instead of inlining silently.
import { TypeScriptInternals } from '@microsoft/api-extractor/lib/analyzer/TypeScriptInternals';
import { unresolvedRelativeImports } from './typescript';

interface ExternalTypeModule {
    readonly declared: string | RegExp;
    readonly matches: (moduleName: string) => boolean;
    count: number;
}

// API Extractor inlines every module the compiler does not resolve from node_modules, including the
// tsconfig path aliases to sibling packages; modules marked here stay imports in the bundled `.d.ts`.
const originalGetResolvedModule = TypeScriptInternals.getResolvedModule;
if (typeof originalGetResolvedModule !== 'function') {
    throw new Error('API Extractor no longer exposes TypeScriptInternals.getResolvedModule');
}
let externalTypeModules: ExternalTypeModule[] = [];
// API Extractor copies the text of inlined declarations, so inlining a TypeScript source would ship its code.
let sourceResolutions: string[] = [];
TypeScriptInternals.getResolvedModule = (program, sourceFile, moduleNameText, mode) => {
    const resolved = originalGetResolvedModule(program, sourceFile, moduleNameText, mode);
    let isExternal = false;
    for (const external of externalTypeModules) {
        if (external.matches(moduleNameText)) {
            external.count++;
            isExternal = true;
        }
    }
    if (resolved && isExternal) {
        return { ...resolved, isExternalLibraryImport: true };
    }
    if (
        resolved &&
        !resolved.isExternalLibraryImport &&
        /\.[cm]?tsx?$/.test(resolved.resolvedFileName) &&
        !/\.d\.[cm]?ts$/.test(resolved.resolvedFileName)
    ) {
        sourceResolutions.push(`'${moduleNameText}' in ${sourceFile.fileName} (${resolved.resolvedFileName})`);
    }
    return resolved;
};

function toExternalTypeModule(declared: string | RegExp): ExternalTypeModule {
    if (typeof declared === 'string') {
        return { declared, matches: name => name === declared, count: 0 };
    }
    // `g`/`y` make `test()` resume at `lastIndex`, so repeated calls would alternate between results.
    const pattern = new RegExp(declared.source, declared.flags.replace(/[gy]/g, ''));
    return { declared, matches: name => pattern.test(name), count: 0 };
}

function sourceImportsError(dtsPath: string, imports: string[], cause?: unknown) {
    return new Error(
        `The declarations of ${dtsPath} import TypeScript sources, list published packages in externalTypes:\n` +
            [...new Set(imports)].join('\n'),
        { cause }
    );
}

/**
 * Bundles the declarations of `dtsPath` into `outputFile`.
 * @param externalTypes Modules kept as imports instead of inlined: exact module names, or patterns for
 * subpaths.
 * @returns The entries of `externalTypes` the declarations import. An entry that no entry point of a package
 * imports is a misconfiguration or a sign that the declarations were inlined.
 */
export default function generateDts(
    root: string,
    dtsPath: string,
    outputFile: string,
    externalTypes: (string | RegExp)[]
): (string | RegExp)[] {
    externalTypeModules = externalTypes.map(toExternalTypeModule);
    sourceResolutions = [];

    const extractorConfig: ExtractorConfig = ExtractorConfig.prepare({
        packageJsonFullPath: path.resolve(root, 'package.json'),
        configObjectFullPath: undefined,
        configObject: {
            projectFolder: root,
            mainEntryPointFilePath: dtsPath,
            compiler: {
                tsconfigFilePath: path.join(root, 'tsconfig.json')
            },
            dtsRollup: {
                enabled: true,
                publicTrimmedFilePath: outputFile,
                omitTrimmingComments: true
            }
        }
    });

    const typescriptPath = path.resolve(url.fileURLToPath(import.meta.resolve('typescript')), '..', '..');
    const modules = externalTypeModules;
    let extractorResult: ExtractorResult;
    let resolvedToSources: string[];
    try {
        extractorResult = Extractor.invoke(extractorConfig, {
            localBuild: process.env.GITHUB_ACTIONS !== 'true',
            typescriptCompilerFolder: typescriptPath
        });
    } catch (e) {
        // API Extractor may fail on the sources before reporting a result
        throw sourceResolutions.length > 0 ? sourceImportsError(dtsPath, sourceResolutions, e) : e;
    } finally {
        externalTypeModules = [];
        resolvedToSources = sourceResolutions;
        sourceResolutions = [];
    }

    if (!extractorResult.succeeded) {
        throw new Error(
            `API Extractor completed with ${extractorResult.errorCount} errors` +
                ` and ${extractorResult.warningCount} warnings`
        );
    }
    if (resolvedToSources.length > 0) {
        throw sourceImportsError(dtsPath, resolvedToSources);
    }
    const unresolved = unresolvedRelativeImports(
        outputFile,
        fs.readFileSync(outputFile, 'utf8'),
        path.dirname(outputFile)
    );
    if (unresolved.length > 0) {
        throw new Error(`${outputFile} imports modules that are not part of the package: ${unresolved.join(', ')}`);
    }
    console.log(`DTS bundled`, outputFile);
    return modules.filter(m => m.count > 0).map(m => m.declared);
}
