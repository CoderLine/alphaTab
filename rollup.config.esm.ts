import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';
import server from './rollup.plugin.server';
import MagicString from 'magic-string';
import { OutputOptions, Plugin, RollupOptions } from 'rollup';

/**
 * Creates the ESM flavor configurations for alphaTab
 */
export default function esm(
    isWatch: boolean,
    commonOutput: Partial<OutputOptions>,
    bundlePlugins: Plugin[]
): RollupOptions[] {
    return [
        // Core Bundle
        {
            input: `src/alphaTab.core.ts`,
            output: [
                {
                    file: 'dist/alphaTab.core.mjs',
                    format: 'es',
                    sourcemap: true
                },
                !isWatch && {
                    file: 'dist/alphaTab.core.min.mjs',
                    format: 'es',
                    plugins: [terser()],
                    sourcemap: true
                }
            ]
                .filter(e => typeof e == 'object')
                .map(o => ({ ...commonOutput, ...o } as OutputOptions)),
            external: [],
            watch: {
                include: ['src/**'],
                exclude: 'node_modules/**'
            },
            plugins: [
                ...bundlePlugins,
                copy({
                    targets: [
                        { src: 'font/bravura/*', dest: 'dist/font' },
                        { src: 'font/sonivox/*', dest: 'dist/soundfont' }
                    ]
                }),
                isWatch &&
                    server({
                        openPage: '/playground/control.html',
                        port: 8080
                    })
            ]
        },

        // Entry points
        ...[
            { input: 'alphaTab.main', output: 'alphaTab' },
            { input: 'alphaTab.worker', output: 'alphaTab.worker' },
            { input: 'alphaTab.worklet', output: 'alphaTab.worklet' }
        ].map(x => {
            return {
                input: `src/${x.input}.ts`,
                output: [
                    {
                        file: `dist/${x.output}.mjs`,
                        format: 'es' as const,
                        sourcemap: true,
                        plugins: [
                            {
                                name: 'adjust-script-paths',
                                renderChunk(code) {
                                    const modifiedCode = new MagicString(code);

                                    modifiedCode
                                        .replaceAll("alphaTab.core'", "alphaTab.core.mjs'")
                                        .replaceAll("alphaTab.worker'", "alphaTab.worker.mjs'")
                                        .replaceAll("alphaTab.worklet'", "alphaTab.worklet.mjs'");

                                    return {
                                        code: modifiedCode.toString(),
                                        map: modifiedCode.generateMap()
                                    };
                                }
                            } as Plugin
                        ]
                    },
                    {
                        file: `dist/${x.output}.min.mjs`,
                        format: 'es' as const,
                        plugins: [
                            {
                                name: 'adjust-script-paths',
                                renderChunk(code) {
                                    const modifiedCode = new MagicString(code);

                                    modifiedCode
                                        .replaceAll("alphaTab.core'", "alphaTab.core.min.mjs'")
                                        .replaceAll("alphaTab.worker'", "alphaTab.worker.min.mjs'")
                                        .replaceAll("alphaTab.worklet'", "alphaTab.worklet.min.mjs'");

                                    return {
                                        code: modifiedCode.toString(),
                                        map: modifiedCode.generateMap()
                                    };
                                }
                            } as Plugin,
                            terser()
                        ],
                        sourcemap: true
                    }
                ],
                external: ['./alphaTab.core'],
                watch: {
                    include: [`src/${x.input}.ts`],
                    exclude: 'node_modules/**'
                },
                plugins: [...bundlePlugins.filter(p => p.name !== 'resolve-typescript-paths')]
            };
        })
    ];
}
