import path from 'node:path';
import url from 'node:url';
import { Extractor, ExtractorConfig, type ExtractorResult } from '@microsoft/api-extractor';

// Internal API of API Extractor; the version is pinned in package.json and every declared external
// must be seen by this hook, so a changed internal fails the build instead of inlining silently.
import { TypeScriptInternals } from '@microsoft/api-extractor/lib/analyzer/TypeScriptInternals';

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
TypeScriptInternals.getResolvedModule = (program, sourceFile, moduleNameText, mode) => {
    const resolved = originalGetResolvedModule(program, sourceFile, moduleNameText, mode);
    let isExternal = false;
    for (const external of externalTypeModules) {
        if (external.matches(moduleNameText)) {
            external.count++;
            isExternal = true;
        }
    }
    return resolved && isExternal ? { ...resolved, isExternalLibraryImport: true } : resolved;
};

function toExternalTypeModule(declared: string | RegExp): ExternalTypeModule {
    if (typeof declared === 'string') {
        return { declared, matches: name => name === declared, count: 0 };
    }
    // `g`/`y` make `test()` resume at `lastIndex`, so repeated calls would alternate between results.
    const pattern = new RegExp(declared.source, declared.flags.replace(/[gy]/g, ''));
    return { declared, matches: name => pattern.test(name), count: 0 };
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
    try {
        extractorResult = Extractor.invoke(extractorConfig, {
            localBuild: process.env.GITHUB_ACTIONS !== 'true',
            typescriptCompilerFolder: typescriptPath
        });
    } finally {
        externalTypeModules = [];
    }

    if (!extractorResult.succeeded) {
        throw new Error(
            `API Extractor completed with ${extractorResult.errorCount} errors` +
                ` and ${extractorResult.warningCount} warnings`
        );
    }
    console.log(`DTS bundled`, outputFile);
    return modules.filter(m => m.count > 0).map(m => m.declared);
}
