/**@target web */
import { AlphaTabWebPackPlugin } from '../../src/alphaTab.webpack';
import webpack from 'webpack';
import path from 'node:path';
import fs from 'node:fs';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { expect } from 'chai';

describe('WebPack', () => {
    it('bundle-correctly', async () => {
        const bundlerProject = './test-data/bundler/webpack';
        // biome-ignore lint/suspicious/noAsyncPromiseExecutor: resolve/reject called accordingly
        await new Promise(async (resolve, reject) => {
            const cwd = process.cwd();
            process.chdir(bundlerProject);
            try {
                await fs.promises.rm(path.join(process.cwd(), 'out'), { force: true, recursive: true });
                webpack(
                    {
                        entry: {
                            app: {
                                import: './src/app.mjs',
                                // see https://github.com/CoderLine/alphaTab/issues/2299
                                library: {
                                    type: 'assign',
                                    name: 'alphaTabApp'
                                }
                            }
                        },
                        output: {
                            filename: '[name]-[contenthash:8].js',
                            path: path.resolve('./out')
                        },
                        plugins: [
                            new AlphaTabWebPackPlugin({
                                alphaTabSourceDir: '../../../dist/'
                            }),
                            new HtmlWebpackPlugin()
                        ],
                        optimization: {
                            minimize: false,
                            splitChunks: {
                                cacheGroups: {}
                            }
                        },
                        module: {
                            parser: {
                                javascript: {
                                    // angular sets this to false, our plugin needs to work like this
                                    worker: false
                                }
                            }
                        }
                    },
                    (err, stats) => {
                        if (stats) {
                            console.log(stats.toString());
                        }

                        process.chdir(cwd);
                        if (err) {
                            reject(err);
                        } else {
                            resolve(null);
                        }
                    }
                );
            } catch (e) {
                process.chdir(cwd);
                reject(e);
            }
        });

        // ensure assets are copied
        const files = [
            path.join(bundlerProject, 'out', 'font', 'Bravura.otf'),
            path.join(bundlerProject, 'out', 'font', 'Bravura.woff'),
            path.join(bundlerProject, 'out', 'font', 'Bravura.woff2'),
            path.join(bundlerProject, 'out', 'font', 'Bravura-OFL.txt'),

            path.join(bundlerProject, 'out', 'soundfont', 'LICENSE'),
            path.join(bundlerProject, 'out', 'soundfont', 'sonivox.sf2')
        ];
        for (const file of files) {
            expect(fs.existsSync(file)).to.eq(true, `File '${file}' Missing`);
        }

        const dir = await fs.promises.readdir(path.join(bundlerProject, 'out'), { withFileTypes: true });

        let appValidated = false;

        let coreFileValidated = false;
        let workletValidated = false;
        let workerValidated = false;

        for (const file of dir) {
            if (file.isFile()) {
                const text = await fs.promises.readFile(path.join(file.parentPath ?? file.path, file.name), 'utf8');

                if (file.name.startsWith('app-')) {
                    // ensure new worker has worker import
                    expect(text).to.include(
                        'new Environment.alphaTabWorker(new Environment.alphaTabUrl(/* worker import */'
                    );
                    // ensure worklet bootstrapper exists
                    expect(text).to.include('/* worklet bootstrap */ async function(__webpack_worklet__) {');
                    // without custom bundling the app will bundle alphatab directly
                    expect(text).to.include('class AlphaTabApiBase');
                    // ensure the library mode is active as needed
                    expect(text).to.include('alphaTabApp = __webpack_exports__');

                    appValidated = true;
                } else if (file.name.endsWith('.js')) {
                    if (text.includes('class AlphaTabApiBase')) {
                        // ensure the library mode is does not affect chunks
                        expect(text).to.not.include('alphaTabApp = __webpack_exports__');
                        coreFileValidated = true; // found core file (imported by worker and worklet)
                    } else if (text.includes('initializeAudioWorklet()')) {
                        // ensure the library mode is does not affect chunks
                        expect(text).to.not.include('alphaTabApp = __webpack_exports__');

                        // ensure chunk installer is there
                        expect(text).to.include('webpack/runtime/alphaTab audio worker chunk loading');
                        workletValidated = true;
                    } else if (text.includes('initializeWorker()')) {
                        // ensure the library mode is does not affect chunks
                        expect(text).to.not.include('alphaTabApp = __webpack_exports__');

                        // ensure chunk loader is there
                        expect(text).to.include('webpack/runtime/importScripts chunk loading');
                        workerValidated = true;
                    }
                }
            }
        }

        expect(appValidated).to.eq(true, 'Missing app validation');
        expect(coreFileValidated).to.eq(true, 'Missing core file validation');
        expect(workerValidated).to.eq(true, 'Missing worker validation');
        expect(workletValidated).to.eq(true, 'Missing worklet validation');
    }).timeout(30000);
});
