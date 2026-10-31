import type { OutputOptions } from 'rollup';
import { defineConfig } from 'vite';
import { addDts, defaultBuildUserConfig, esm } from '../tooling/src/vite';

export default defineConfig(() => {
    const config = defaultBuildUserConfig(import.meta.dirname);
    config.build!.sourcemap = true;
    esm(config, import.meta.dirname, 'index', 'src/index.tsx', { withMin: false });
    // the bundler drops module-level directives, so the client boundary for React Server Components
    // is added to the output; the licence comment may precede it
    for (const output of config.build!.rollupOptions!.output as OutputOptions[]) {
        output.banner = "'use client';";
    }
    // the tsconfig path aliases would otherwise bundle alphaTab's source
    (config.build!.rollupOptions!.external as (RegExp | string)[]).push(
        '@coderline/alphatab',
        'react',
        'react-dom',
        'react/jsx-runtime'
    );
    addDts(config, import.meta.dirname, { externalTypes: ['@coderline/alphatab'] });
    return config;
});
