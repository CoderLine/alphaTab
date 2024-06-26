import resolve from './rollup.plugin.resolve';
import dts from 'rollup-plugin-dts';
import license from 'rollup-plugin-license';
import fs from 'fs';
import typescript from '@rollup/plugin-typescript';
import { ModuleFormat, RollupOptions } from 'rollup';

import esm from './rollup.config.esm';
import cjs from './rollup.config.cjs';
import webpack from './rollup.config.webpack';
import vite from './rollup.config.vite';

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
    } satisfies RollupOptions,

    //
    // Bundlers
    ...webpack(isWatch, bundlePlugins),
    ...vite(isWatch, bundlePlugins)
].map(x => {
    x.onLog = (level, log, handler) => {
        if (log.code === 'CIRCULAR_DEPENDENCY') {
            return; // Ignore circular dependency warnings
        }
        handler(level, log);
    };

    if (x.watch) {
        x.watch.clearScreen = false;
    }
    return x;
});
