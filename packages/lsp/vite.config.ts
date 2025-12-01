import { defaultClientMainFields, defineConfig } from 'vite';
import type { OutputOptions } from 'rollup';
import { defaultBuildUserConfig, dtsPathsTransformer, esm } from '../tooling/src/vite';

export default defineConfig(() => {
    const config = defaultBuildUserConfig();
    config.build!.sourcemap = true;
    config.resolve ??= {};
    config.resolve.mainFields = defaultClientMainFields.filter(f => f !== 'browser');

    esm(config, import.meta.dirname, 'server', 'src/index.ts', {
        module: 'preserve',
        transformers: {
            afterDeclarations: [dtsPathsTransformer()]
        }
    });
    (config.build!.rollupOptions!.external as (RegExp | string)[]).push('@coderline/alphatab');
    return config;
});
