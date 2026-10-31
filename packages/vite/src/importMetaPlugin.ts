import MagicString from 'magic-string';
import type { Plugin } from 'vite';
import type { AlphaTabVitePluginOptions } from './AlphaTabVitePluginOptions';

// The URL alphaTab passes to `new Worker(...)` and `audioWorklet.addModule(...)`.
// Only the standard `new URL(<literal>, import.meta.url)` form matches; the
// `alphaTabUrl` fallback markers stay untouched.
const alphaTabEntryUrlPattern =
    /\bnew\s+URL\s*\(\s*(['"`])(\.\/alphaTab\.(worker|worklet)\.mjs)\1\s*,\s*import\.meta\.url\s*\)/g;

/**
 * Emits alphaTab's Web Worker and Audio Worklet entries as ES chunks of the
 * main build, so page, worker and worklet import the same alphaTab core chunk.
 *
 * The dev server serves alphaTab unbundled: it is excluded from dependency
 * pre-bundling, which would move the main module away from the worker and
 * worklet files its relative URLs point to.
 * @public
 */
export function importMetaUrlPlugin(options: AlphaTabVitePluginOptions): Plugin {
    const kinds = new Set<string>();
    if (options.webWorkers !== false) {
        kinds.add('worker');
    }
    if (options.audioWorklets !== false) {
        kinds.add('worklet');
    }
    let isBuild = false;

    return {
        name: 'vite-plugin-alphatab-url',
        // runs before Vite's own worker and asset plugins, which would bundle the
        // worker separately and copy the worklet as an unbundled asset
        enforce: 'pre',

        config(_config, env) {
            if (env.command === 'serve') {
                return { optimizeDeps: { exclude: ['@coderline/alphatab'] } };
            }
            return;
        },

        configResolved(config) {
            isBuild = config.command === 'build';
        },

        async transform(code, id, transformOptions) {
            if (!isBuild || kinds.size === 0 || transformOptions?.ssr || !code.includes('import.meta.url')) {
                return;
            }

            let s: MagicString | undefined;
            for (const match of code.matchAll(alphaTabEntryUrlPattern)) {
                if (!kinds.has(match[3])) {
                    continue;
                }

                const resolved = await this.resolve(match[2], id);
                if (!resolved || resolved.external) {
                    this.warn(`Could not resolve alphaTab ${match[3]} entry '${match[2]}' from '${id}'`);
                    continue;
                }

                const ref = this.emitFile({ type: 'chunk', id: resolved.id, preserveSignature: false });
                s ??= new MagicString(code);
                s.update(
                    match.index,
                    match.index + match[0].length,
                    `new URL(import.meta.ROLLUP_FILE_URL_${ref}, import.meta.url)`
                );
            }

            if (!s) {
                return;
            }

            return {
                code: s.toString(),
                map: s.generateMap({ hires: 'boundary', source: id })
            };
        }
    };
}
