import { Plugin, RollupOptions } from 'rollup';
import dts from 'rollup-plugin-dts';
import resolve from './rollup.plugin.resolve';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const importMetaPlugin = {
    name: 'import-meta',
    resolveImportMeta() {
        return '{}'; // prevent import.meta to be empty in non ES outputs
    }
};

export default function vite(isWatch: boolean, bundlePlugins: Plugin[]): RollupOptions[] {
    const outputVite = !isWatch || !!process.env.ALPHATAB_VITE;
    if (!outputVite) {
        return [];
    }

    return [
        {
            input: 'dist/types/alphaTab.vite.d.ts',
            output: [
                {
                    file: 'dist/alphaTab.vite.d.ts',
                    format: 'es'
                }
            ],
            external: ['vite', 'rollup', 'fs', 'url'],
            plugins: [
                dts(),
                resolve({
                    mappings: {
                        '@src': 'dist/types'
                    },
                    types: true
                })
            ]
        },
        {
            input: 'src/alphaTab.vite.ts',
            output: [
                {
                    name: 'alphaTabVite',
                    file: 'dist/alphaTab.vite.js',
                    plugins: [importMetaPlugin],
                    sourcemap: true,
                    format: 'cjs'
                }
            ],
            external: ['vite', 'rollup'],
            watch: {
                include: ['src/alphaTab.vite.ts', 'src/vite/**'],
                exclude: 'node_modules/**'
            },
            plugins: [...bundlePlugins, commonjs(), nodeResolve()]
        },
        {
            input: 'src/alphaTab.vite.ts',
            output: [
                {
                    file: 'dist/alphaTab.vite.mjs',
                    plugins: [],
                    sourcemap: true,
                    format: 'es'
                }
            ],
            external: ['vite', 'rollup', 'fs', 'path'],
            watch: {
                include: ['src/alphaTab.vite.ts', 'src/vite/**'],
                exclude: 'node_modules/**'
            },
            plugins: [...bundlePlugins, nodeResolve()]
        }
    ];
}
