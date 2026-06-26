import { defaultClientMainFields, defineConfig } from 'vite';
import { addDts, defaultBuildUserConfig, esm } from '../tooling/src/vite';

export default defineConfig(() => {
    const config = defaultBuildUserConfig(import.meta.dirname);
    config.build!.sourcemap = true;
    config.resolve ??= {};
    config.resolve.mainFields = defaultClientMainFields.filter(f => f !== 'browser');

    esm(config, import.meta.dirname, 'server', 'src/index.ts');
    (config.build!.rollupOptions!.external as (RegExp | string)[]).push('@coderline/alphatab');
    addDts(config, import.meta.dirname);

    return config;
});
