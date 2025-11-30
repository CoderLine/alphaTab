import {  defineConfig } from 'vite';
import { defaultBuildUserConfig, dtsPathsTransformer, esm } from '../tooling/src/vite';

export default defineConfig(() => {
    const config = defaultBuildUserConfig();
    esm(config, import.meta.dirname, 'alphaTab.monaco', 'src/alphaTab.monaco.ts', {
        module: 'preserve',
        transformers: {
            afterDeclarations: [
                dtsPathsTransformer()
            ]
        }
    });
    (config.build!.rollupOptions!.external as (RegExp | string)[]).push('@coderline/alphatab');

    return config;
});
