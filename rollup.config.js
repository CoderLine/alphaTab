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

const bundlePlugins = [
    typescript({
        tsconfig: "./tsconfig.build.json",
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

const isWatch = process.env.ROLLUP_WATCH;

const settings = [
    //
    // ESM Flavor 

    // Core Bundle
    {
        input: `src/alphaTab.core.ts`,
        output: [
            {
                file: 'dist/alphaTab.core.mjs',
                format: 'es',
                sourcemap: false
            },
            !isWatch && {
                file: 'dist/alphaTab.core.min.mjs',
                format: 'es',
                plugins: [terser()],
                sourcemap: false
            }
        ].filter(e => typeof e == "object").map(o => ({ ...commonOutput, ...o })),
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
            isWatch && server({
                openPage: '/playground/control.html',
                port: 8080
            })
        ]
    },

    // Entry points
    ...[
        { input: "alphaTab.main", output: "alphaTab" },
        { input: "alphaTab.worker", output: "alphaTab.worker" },
        { input: "alphaTab.worklet", output: "alphaTab.worklet" }
    ].map(x => {
        return {
            input: `src/${x.input}.ts`,
            output: [
                {
                    file: `dist/${x.output}.mjs`,
                    format: 'es',
                    sourcemap: false,
                    plugins: [
                        {
                            name: 'adjust-script-paths',
                            renderChunk(code) {
                                return code
                                    .replaceAll('alphaTab.core\'', 'alphaTab.core.mjs\'')
                                    .replaceAll('alphaTab.worker\'', 'alphaTab.worker.mjs\'')
                                    .replaceAll('alphaTab.worklet\'', 'alphaTab.worklet.mjs\'');
                            }
                        }
                    ],
                },
                {
                    file: `dist/${x.output}.min.mjs`,
                    format: 'es',
                    plugins: [
                        {
                            name: 'adjust-script-paths',
                            renderChunk(code) {
                                return code
                                    .replaceAll('alphaTab.core\'', 'alphaTab.core.min.mjs\'')
                                    .replaceAll('alphaTab.worker\'', 'alphaTab.worker.min.mjs\'')
                                    .replaceAll('alphaTab.worklet\'', 'alphaTab.worklet.mjs\'');
                            }
                        },
                        terser()
                    ],
                    sourcemap: false
                }
            ],
            external: [
                './alphaTab.core'
            ],
            watch: {
                include: [`src/${x.input}.ts`],
                exclude: 'node_modules/**'
            },
            plugins: [
                typescript({
                    tsconfig: "./tsconfig.build.json",
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
                })
            ]
        }
    }),

    //
    // UMD Flavor
    !isWatch && {
        input: `src/alphaTab.main.ts`,
        output: [
            {
                file: 'dist/alphaTab.js',
                plugins: [importMetaPlugin],
                sourcemap: false
            },
            {
                file: 'dist/alphaTab.min.js',
                plugins: [terser(), importMetaPlugin],
                sourcemap: false
            }
        ].map(o => ({ ...commonOutput, ...o })),
        watch: {
            include: ['src/**'],
            exclude: 'node_modules/**'
        },
        plugins: [
            ...bundlePlugins,
        ]
    },

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
    }
].filter(x => x);

module.exports = settings;