const resolve = require('./rollup.resolve');
const terser = require('rollup-plugin-terser').terser;
const dts = require('rollup-plugin-dts').default;
const copy = require('rollup-plugin-copy');
const branch = require('git-branch');
const license = require('rollup-plugin-license');

const commonOutput = {
    name: 'alphaTab',
    format: 'umd',
    globals: {
        jQuery: 'jQuery'
    }
};

module.exports = [
    {
        input: `dist/lib/alphatab.js`,
        output: [
            {
                file: 'dist/alphaTab.js',
                name: 'alphaTab'
            },
            {
                file: 'dist/alphaTab.min.js',
                name: 'alphaTab',
                plugins: [terser()]
            }
        ].map(o => ({ ...o, ...commonOutput })),
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
                        let gitBranch = branch.sync();
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
            })
        ]
    },
    // https://github.com/Swatinem/rollup-plugin-dts/issues/86
    // {
    //     input: 'dist/types/alphatab.d.ts',
    //     output: [
    //         {
    //             file: 'dist/alphaTab.d.ts',
    //             format: 'es'
    //         }
    //     ],
    //     plugins: [
    //         resolve({
    //             mappings: {
    //                 '@src': 'dist/types'
    //             },
    //             types: true
    //         }),
    //         dts()
    //     ]
    // }
];
