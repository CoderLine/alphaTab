import { Extractor, ExtractorConfig, ExtractorResult } from '@microsoft/api-extractor';
import path from 'path';
import url from 'url';

export default function generateDts(root: string, entryFile: string, outputFilename: string) {
    const relativePath = path.relative(root, entryFile);
    const dtsRoot = path.resolve(root, 'dist', 'types');
    const dtsPath = path.resolve(dtsRoot, relativePath).replace('.ts', '.d.ts');

    const outputFile: string = path.join(root, 'dist', outputFilename);

    const extractorConfig: ExtractorConfig = ExtractorConfig.prepare({
        packageJsonFullPath: path.resolve(root, 'package.json'),
        configObjectFullPath: undefined,
        configObject: {
            projectFolder: root,
            mainEntryPointFilePath: dtsPath,
            compiler: {
                overrideTsconfig: {
                    compilerOptions: {
                        paths: {
                            '@src/*': [dtsRoot]
                        }
                    }
                }
            },
            dtsRollup: {
                enabled: true,
                publicTrimmedFilePath: outputFile
            }
        }
    });

    const typescriptPath = path.resolve(url.fileURLToPath(import.meta.resolve('typescript')), '..', '..');
    const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
        localBuild: process.env.GITHUB_ACTIONS !== 'true',
        typescriptCompilerFolder: typescriptPath
    });

    if (extractorResult.succeeded) {
        console.log(`DTS bundled`, entryFile, outputFile);
    } else {
        throw new Error(
            `API Extractor completed with ${extractorResult.errorCount} errors` +
                ` and ${extractorResult.warningCount} warnings`
        );
    }
}
