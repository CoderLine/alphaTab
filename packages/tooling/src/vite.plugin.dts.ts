import path from 'node:path';
import url from 'node:url';
import { Extractor, ExtractorConfig, type ExtractorResult } from '@microsoft/api-extractor';
import type ts from 'typescript';

import { ExportAnalyzer } from '@microsoft/api-extractor/lib/analyzer/ExportAnalyzer';

const original = (ExportAnalyzer.prototype as any)._isExternalModulePath;
let exportAnalyzerExternals: (string | RegExp)[] = [];
(ExportAnalyzer.prototype as any)._isExternalModulePath = function (
    importOrExportDeclaration: ts.ImportDeclaration | ts.ExportDeclaration | ts.ImportTypeNode,
    moduleSpecifier: string
) {
    if (exportAnalyzerExternals.length > 0) {
        for (const ex of exportAnalyzerExternals) {
            if (typeof ex === 'string' && ex === moduleSpecifier) {
                return true;
            } else if (ex instanceof RegExp && ex.test(moduleSpecifier)) {
                return true;
            }
        }
    }

    return original.call(this, importOrExportDeclaration, moduleSpecifier);
};

export default function generateDts(root: string, dtsPath: string, outputFile: string, externals: (string | RegExp)[]) {
    exportAnalyzerExternals = externals;

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
