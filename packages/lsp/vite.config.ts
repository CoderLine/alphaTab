import { defaultClientMainFields, defineConfig } from 'vite';
import { addDts, defaultBuildUserConfig, esm } from '../tooling/src/vite';

export default defineConfig(() => {
    const config = defaultBuildUserConfig(import.meta.dirname);
    config.build!.sourcemap = true;
    config.resolve ??= {};
    config.resolve.mainFields = defaultClientMainFields.filter(f => f !== 'browser');

    esm(config, import.meta.dirname, 'index.browser', 'src/index.browser.ts');
    esm(config, import.meta.dirname, 'index.node', 'src/index.node.ts', { withMin: false });
    esm(config, import.meta.dirname, 'server/browser', 'src/server/browser.ts', { withMin: false });
    esm(config, import.meta.dirname, 'server/node', 'src/server/node.ts', { withMin: false });
    (config.build!.rollupOptions!.external as (RegExp | string)[]).push('@coderline/alphatab');
    addDts(config, import.meta.dirname);
    return config;
});
