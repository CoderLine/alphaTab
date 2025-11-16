import path from 'node:path';
import { defaultBuildUserConfig, dtsPathsTransformer, esm } from '@coderline/alphatab-tooling/src/vite';
import { defaultClientMainFields, defineConfig } from 'vite';

export default defineConfig(({ command }) => {
    if (command === 'serve') {
        return {};
    } else {
        const config = defaultBuildUserConfig();
        config.build!.sourcemap = true;
        config.resolve ??= {};
        config.resolve.mainFields = defaultClientMainFields.filter(f => f !== 'browser');

        esm(config, import.meta.dirname, 'server', 'src/index.ts', {
            module: 'preserve',
            transformers: {
                afterDeclarations: [
                    dtsPathsTransformer({
                        '@src/': path.resolve(__dirname, 'src')
                    })
                ]
            }
        });
        (config.build!.rollupOptions!.external as (RegExp | string)[]).push(/^vscode/, '@coderline/alphatab');

        return config;
    }
});
