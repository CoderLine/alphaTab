import resolve from './rollup.plugin.resolve';
import dts from 'rollup-plugin-dts';
import license from 'rollup-plugin-license';
import fs from 'fs';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { ModuleFormat, RollupOptions } from 'rollup';

import esm from './rollup.config.esm';
import cjs from './rollup.config.cjs';

function getGitBranch(): string {
    const filepath = '.git/HEAD';
    if (!fs.existsSync(filepath)) {
        throw new Error('.git/HEAD does not exist');
    }
    const buf = fs.readFileSync(filepath);
    const match = /ref: refs\/heads\/([^\n]+)/.exec(buf.toString());
    return match ? match[1] : '';
}

const commonOutput = {
    name: 'alphaTab',
    format: 'umd' as ModuleFormat,
    globals: {
        jQuery: 'jQuery'
    }
};

const importMetaPlugin = {
    resolveImportMeta() {
        return '{}'; // prevent import.meta to be empty in non ES outputs
    }
};

const bundlePlugins = [
    typescript({
        tsconfig: './tsconfig.build.json',
        outputToFilesystem: true
    }),
    license({
        banner: {
            content: {
                file: 'LICENSE.header'
            },
            data() {
                let buildNumber = process.env.GITHUB_RUN_NUMBER || 0;
                let gitBranch = getGitBranch();
                return {
                    branch: gitBranch,
                    build: buildNumber
                };
            }
        }
    }),
    resolve({
        mappings: {
            '@src': 'dist/lib'
        }
    })
];

const isWatch = !!process.env.ROLLUP_WATCH;

export default [
    ...esm(isWatch, commonOutput, bundlePlugins),
    ...cjs(isWatch, commonOutput, bundlePlugins),

    //
    // typescript type declarations
    {
        input: 'dist/types/alphaTab.main.d.ts',
        output: [
            {
                file: 'dist/alphaTab.d.ts',
                format: 'es'
            }
        ],
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

    //
    // WebPack plugin
    !isWatch && {
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
    !isWatch && {
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
        external: ['webpack', 'webpack/lib/ModuleTypeConstants', 'webpack/lib/util/makeSerializable', 'fs', 'path'],
        watch: {
            include: ['src/alphaTab.webpack.ts'],
            exclude: 'node_modules/**'
        },
        plugins: [...bundlePlugins, commonjs()]
    },
    (!isWatch || !!process.env.ALPHATAB_WEBPACK) && {
        input: 'src/alphaTab.webpack.ts',
        output: [
            {
                file: 'dist/alphaTab.webpack.mjs',
                plugins: [],
                sourcemap: true,
                format: 'es'
            }
        ],
        external: ['webpack', 'webpack/lib/ModuleTypeConstants', 'webpack/lib/util/makeSerializable', 'fs', 'path'],
        watch: {
            include: ['src/alphaTab.webpack.ts', "src/webpack/**"],
            exclude: 'node_modules/**'
        },
        plugins: [...bundlePlugins]
    }
]
    .filter(x => x)
    .map(x => {
        const c = {
            ...(x as RollupOptions),
            onLog: (level, log, handler) => {
                if (log.code === 'CIRCULAR_DEPENDENCY') {
                    return; // Ignore circular dependency warnings
                }
                handler(level, log);
            }
        } as RollupOptions;
        if (c.watch) {
            c.watch.clearScreen = false;
        }
        return c;
    });
