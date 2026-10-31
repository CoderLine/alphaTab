import path from 'node:path';
import url from 'node:url';
import { Extractor, ExtractorConfig, type ExtractorResult } from '@microsoft/api-extractor';

import { TypeScriptInternals } from '@microsoft/api-extractor/lib/analyzer/TypeScriptInternals';

// API Extractor inlines every module the compiler does not resolve from node_modules, including the
// tsconfig path aliases to sibling packages; modules marked here stay imports in the bundled `.d.ts`.
const originalGetResolvedModule = TypeScriptInternals.getResolvedModule;
let externalTypeModules: (string | RegExp)[] = [];
TypeScriptInternals.getResolvedModule = (program, sourceFile, moduleNameText, mode) => {
    const resolved = originalGetResolvedModule(program, sourceFile, moduleNameText, mode);
    const isExternal = externalTypeModules.some(ex =>
        typeof ex === 'string' ? ex === moduleNameText : ex.test(moduleNameText)
    );
    return resolved && isExternal ? { ...resolved, isExternalLibraryImport: true } : resolved;
};

export default function generateDts(
    root: string,
    dtsPath: string,
    outputFile: string,
    externalTypes: (string | RegExp)[]
) {
    externalTypeModules = externalTypes;

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
    const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
        localBuild: process.env.GITHUB_ACTIONS !== 'true',
        typescriptCompilerFolder: typescriptPath
    });

    if (extractorResult.succeeded) {
        console.log(`DTS bundled`, outputFile);
    } else {
        throw new Error(
            `API Extractor completed with ${extractorResult.errorCount} errors` +
                ` and ${extractorResult.warningCount} warnings`
        );
    }
}
