import path from 'node:path';
import url from 'node:url';
import { Extractor, ExtractorConfig, type ExtractorResult } from '@microsoft/api-extractor';

export default function generateDts(root: string, dtsPath: string, outputFile: string) {
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
