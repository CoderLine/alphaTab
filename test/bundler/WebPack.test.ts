import { AlphaTabWebPackPlugin } from '../../src/alphaTab.webpack';
import webpack from 'webpack';
import path from 'path'
import fs from 'fs'
import HtmlWebpackPlugin from 'html-webpack-plugin';

describe('WebPack', () => {
    it('should-create-worker', () => {
        return new Promise(async (resolve, reject) => {
            const cwd = process.cwd();
            process.chdir('./test-data/bundler/webpack')
            try {
                await fs.promises.rm(path.join(process.cwd(), "out"), { force: true, recursive: true });
                webpack({
                    entry: {
                        app: './src/app.mjs'
                    },
                    output: {
                        filename: "[name].js",
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
                            cacheGroups: {
                            },
                        },
                    },
                }, (err, stats) => {
                    process.chdir(cwd);
                    if (err) {
                        reject(err);
                    } else {
                        resolve(null)
                    }
                })
            }
            catch (e) {
                process.chdir(cwd)
                reject(e);
            }
        })
    }).timeout(30000);
})