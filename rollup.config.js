const resolve = require('./rollup.resolve');
const terser = require('rollup-plugin-terser').terser;
const dts = require('rollup-plugin-dts').default;
const copy = require('rollup-plugin-copy');
const license = require('rollup-plugin-license');
const serve = require('rollup-plugin-serve');
const fs = require('fs');

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
        input: `dist/lib/alphatab.js`,
        output: [
            {
                file: 'dist/alphaTab.js',
                plugins: [importMetaPlugin]
            },
            {
                file: 'dist/alphaTab.min.js',
                plugins: [terser(), importMetaPlugin]
            },
            {
                file: 'dist/alphaTab.mjs',
                format: 'es'
            },
            {
                file: 'dist/alphaTab.min.mjs',
                format: 'es',
                plugins: [terser()]
            }
        ].map(o => ({ ...commonOutput, ...o })),
        external: [],
        watch: {
            include: 'dist/lib/**',
            exclude: 'node_modules/**'
        },
        plugins: [
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
                serve({
                    open: true,
                    openPage: '/playground/control.html',
                    contentBase: '',
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
