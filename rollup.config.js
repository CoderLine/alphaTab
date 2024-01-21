const resolve = require('./rollup.resolve');
const terser = require('@rollup/plugin-terser');
const dts = require('rollup-plugin-dts').default;
const copy = require('rollup-plugin-copy');
const license = require('rollup-plugin-license');
const server = require('./rollup.server');
const fs = require('fs');
const typescript = require('@rollup/plugin-typescript');

function getGitBranch() {
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
    format: 'umd',
    globals: {
        jQuery: 'jQuery'
    }
};

const importMetaPlugin = {
    resolveImportMeta() {
        return '{}'; // prevent import.meta to be empty in non ES outputs
    }
};

const isWatch = process.env.ROLLUP_WATCH;

module.exports = [
    {
        input: `src/alphatab.ts`,
        output: isWatch
            ? [
                {
                    file: 'dist/alphaTab.mjs',
                    format: 'es',
                    sourcemap: true
                }
            ]
            : [
                {
                    file: 'dist/alphaTab.js',
                    plugins: [importMetaPlugin],
                    sourcemap: true
                },
                {
                    file: 'dist/alphaTab.min.js',
                    plugins: [terser(), importMetaPlugin],
                    sourcemap: false
                },
                {
                    file: 'dist/alphaTab.mjs',
                    format: 'es',
                    sourcemap: true
                },
                {
                    file: 'dist/alphaTab.min.mjs',
                    format: 'es',
                    plugins: [terser()],
                    sourcemap: false
                }
            ].map(o => ({ ...commonOutput, ...o })),
        external: [],
        watch: {
            include: ['src/**', 'test/**'],
            exclude: 'node_modules/**'
        },
        plugins: [
            typescript({
                tsconfig: "./tsconfig.build.json"
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

            copy({
                targets: [
                    { src: 'font/bravura/*', dest: 'dist/font' },
                    { src: 'font/sonivox/*', dest: 'dist/soundfont' }
                ]
            }),
            resolve({
                mappings: {
                    '@src': 'dist/lib'
                }
            }),

            isWatch &&
            server({
                openPage: '/playground/control.html',
                port: 8080
            })
        ]
    },
    {
        input: 'dist/types/alphatab.d.ts',
        output: [
            {
                file: 'dist/alphaTab.d.ts',
                format: 'es'
            }
        ],
        plugins: [
            resolve({
                mappings: {
                    '@src': 'dist/types'
                },
                types: true
            }),
            dts()
        ]
    }
];
