import { Plugin, RollupOptions } from 'rollup';
import dts from 'rollup-plugin-dts';
import resolve from './rollup.plugin.resolve';
import commonjs from '@rollup/plugin-commonjs';

const importMetaPlugin = {
    name: 'import-meta',
    resolveImportMeta() {
        return '{}'; // prevent import.meta to be empty in non ES outputs
    }
};

export default function webpack(isWatch: boolean, bundlePlugins: Plugin[]): RollupOptions[] {
    const outputWebPack = !isWatch || !!process.env.ALPHATAB_WEBPACK;
    if (!outputWebPack) {
        return [];
    }

    return [
        {
            input: 'dist/types/alphaTab.webpack.d.ts',
            output: [
                {
                    file: 'dist/alphaTab.webpack.d.ts',
                    format: 'es'
                }
            ],
            external: ['webpack'],
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
            input: 'src/alphaTab.webpack.ts',
            output: [
                {
                    name: 'alphaTabWebPack',
                    file: 'dist/alphaTab.webpack.js',
                    plugins: [importMetaPlugin],
                    sourcemap: true,
                    format: 'cjs'
                }
            ],
            external: [
                'webpack',
                'fs',
                'path',
                'url'
            ],
            watch: {
                include: ['src/alphaTab.webpack.ts'],
                exclude: 'node_modules/**'
            },
            plugins: [...bundlePlugins, commonjs()]
        },
        {
            input: 'src/alphaTab.webpack.ts',
            output: [
                {
                    file: 'dist/alphaTab.webpack.mjs',
                    plugins: [],
                    sourcemap: true,
                    format: 'es'
                }
            ],
            external: [
                'webpack',
                'fs',
                'path'
            ],
            watch: {
                include: ['src/alphaTab.webpack.ts', 'src/webpack/**'],
                exclude: 'node_modules/**'
            },
            plugins: [...bundlePlugins]
        }
    ];
}
