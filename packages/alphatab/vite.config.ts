import path from 'node:path';
import url from 'node:url';
import { esm as defaultEsm, dtsPathsTransformer } from '@coderline/alphatab-tooling/src/vite';
import type { RollupTypescriptOptions } from '@rollup/plugin-typescript';
import MagicString from 'magic-string';
import type { OutputOptions } from 'rollup';
import { defineConfig, type LibraryOptions, type Plugin } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { defaultBuildUserConfig, umd } from '../tooling/src/vite';
import { elementStyleUsingTransformer } from './scripts/element-style-transformer';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// ensure we have file extensions in the URL worker resolve area
const adjustScriptPathsPlugin = (min: boolean) => {
    return {
        name: 'adjust-script-paths',
        renderChunk(code) {
            const modifiedCode = new MagicString(code);
            const extension = min ? '.min.mjs' : '.mjs';
            modifiedCode.replaceAll(
                /(@src|\.)\/alphaTab\.(core|worker|worklet)(\.ts)?(['"])/g,
                `./alphaTab.$2${extension}$4`
            );

            return {
                code: modifiedCode.toString(),
                map: modifiedCode.generateMap()
            };
        }
    } satisfies Plugin;
};

export default defineConfig(({ mode }) => {
    const config = defaultBuildUserConfig();
    config.plugins!.push(
        viteStaticCopy({
            targets: [
                { src: 'font/bravura/*', dest: 'font/' },
                { src: 'font/sonivox/*', dest: 'soundfont/' }
            ]
        })
    );

    const lib = config.build!.lib! as LibraryOptions;
    const entry = lib.entry as Record<string, string>;
    entry['alphatab.core'] = path.resolve(__dirname, 'src/alphaTab.core.ts');
    entry.alphatab = path.resolve(__dirname, 'src/alphaTab.main.ts');
    entry['alphatab.worker'] = path.resolve(__dirname, 'src/alphaTab.worker.ts');
    entry['alphatab.worklet'] = path.resolve(__dirname, 'src/AlphaTab.worklet.ts');
    lib.name = 'alphaTab';

    const typeScriptOptions = (): Partial<RollupTypescriptOptions> => {
        return {
            transformers: {
                before: [elementStyleUsingTransformer()],
                afterDeclarations: [
                    dtsPathsTransformer({
                        '@src/': path.resolve(__dirname, 'src')
                    })
                ]
            }
        };
    };

    const esm = (name: string, entry: string) => {
        defaultEsm(
            config,
            __dirname,
            name,
            entry,
            typeScriptOptions(),
            chunk => !chunk.facadeModuleId!.endsWith('alphaTab.core.ts')
        );

        (config.build!.rollupOptions!.external as string[]).push('@src/alphaTab.core');
    };

    switch (mode) {
        case 'umd':
            umd(config, __dirname, 'alphaTab', 'src/alphaTab.main.ts', typeScriptOptions(), true);
            break;
        //case 'esm':
        default:
            esm('alphaTab', 'src/alphaTab.main.ts');
            lib.entry['alphaTab.core'] = path.resolve(__dirname, 'src/alphaTab.core.ts');
            lib.entry['alphaTab.worker'] = path.resolve(__dirname, 'src/alphaTab.worker.ts');
            lib.entry['alphaTab.worklet'] = path.resolve(__dirname, 'src/alphaTab.worklet.ts');
            
            for (const output of config.build!.rollupOptions!.output as OutputOptions[]) {
                const isMin = (output.entryFileNames as string).includes('.min');
                (output.plugins as Plugin[]).push(adjustScriptPathsPlugin(isMin));
            }
            break;
    }

    return config;
});
