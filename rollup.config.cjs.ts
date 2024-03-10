import terser from '@rollup/plugin-terser';
import { OutputOptions, Plugin, RollupOptions } from 'rollup';

const importMetaPlugin = {
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
): (RollupOptions | boolean)[] {
    const withCjs = !isWatch || !!process.env.ALPHATAB_CJS;
    return [
        withCjs && {
            input: `src/alphaTab.main.ts`,
            output: [
                {
                    file: 'dist/alphaTab.js',
                    plugins: [importMetaPlugin],
                    sourcemap: true
                },
                {
                    file: 'dist/alphaTab.min.js',
                    plugins: [terser(), importMetaPlugin],
                    sourcemap: true
                }
            ].map(o => ({ ...commonOutput, ...o } as OutputOptions)),
            watch: {
                include: ['src/**'],
                exclude: 'node_modules/**'
            },
            plugins: [...bundlePlugins]
        }
    ];
}
