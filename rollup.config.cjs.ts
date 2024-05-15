import terser from '@rollup/plugin-terser';
import { OutputOptions, Plugin, RollupOptions } from 'rollup';

const importMetaPlugin = {
    name: 'import-meta',
    resolveImportMeta() {
        return '{}'; // prevent import.meta to be empty in non ES outputs
    }
};

/**
 * Creates the ESM flavor configurations for alphaTab
 */
export default function cjs(
    isWatch: boolean,
    commonOutput: Partial<OutputOptions>,
    bundlePlugins: Plugin[]
): RollupOptions[] {
    const withCjs = !isWatch || !!process.env.ALPHATAB_CJS;
    if (!withCjs) {
        return [];
    }

    return [
        {
            input: `src/alphaTab.main.ts`,
            output: [
                {
                    ...commonOutput,
                    file: 'dist/alphaTab.js',
                    plugins: [importMetaPlugin],
                    sourcemap: true
                },
                {
                    ...commonOutput,
                    file: 'dist/alphaTab.min.js',
                    plugins: [terser(), importMetaPlugin],
                    sourcemap: true
                }
            ],
            watch: {
                include: ['src/**'],
                exclude: 'node_modules/**'
            },
            plugins: [...bundlePlugins]
        }
    ];
}
