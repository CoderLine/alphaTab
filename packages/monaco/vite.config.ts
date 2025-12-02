import { defineEsmLibConfig } from '../tooling/src/vite';

export default defineEsmLibConfig(config => {
    (config.build!.rollupOptions!.external as (RegExp | string)[]).push(
        '@coderline/alphatab',
        '@coderline/alphatab-language-server',
        'monaco-editor'
    );
});
