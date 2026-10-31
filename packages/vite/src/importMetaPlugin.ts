import path from 'node:path';
import MagicString from 'magic-string';
import type { Plugin } from 'vite';
import type { AlphaTabVitePluginOptions } from './AlphaTabVitePluginOptions';

// The URL alphaTab passes to `new Worker(...)` and `audioWorklet.addModule(...)`.
// Only the standard `new URL(<literal>, import.meta.url)` form matches; the
// `alphaTabUrl` fallback markers stay untouched.
const alphaTabEntryUrlPattern =
    /\bnew\s+URL\s*\(\s*(['"`])(\.\/alphaTab\.(worker|worklet)\.mjs)\1\s*,\s*import\.meta\.url\s*\)/g;

// Stands for an emitted entry until its file name is known. An identifier, not a string, so that
// neither Vite's worker nor its asset `new URL(...)` handling claims it.
const entryPlaceholderPrefix = '__ALPHATAB_ENTRY_URL_';
const entryPlaceholderPattern = /\b__ALPHATAB_ENTRY_URL_(\d+)__\b/g;

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
    // Indexed by the placeholder number; the plugin instance serves every build environment
    // (e.g. Nuxt's client and server builds), so each environment tracks its own entries.
    const entryReferences: string[] = [];
    const environmentEntries = new Map<string, number[]>();
    const trackEntry = (environment: { name: string } | undefined, ref: string) => {
        const index = entryReferences.push(ref) - 1;
        entriesOf(environment).push(index);
        return index;
    };
    const entriesOf = (environment: { name: string } | undefined) => {
        const name = environment?.name ?? '';
        let entries = environmentEntries.get(name);
        if (!entries) {
            entries = [];
            environmentEntries.set(name, entries);
        }
        return entries;
    };

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

        buildStart() {
            entriesOf(this.environment).length = 0;
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
                    `new URL(${entryPlaceholderPrefix}${trackEntry(this.environment, ref)}__, import.meta.url)`
                );
            }

            if (!s) {
                return;
            }

            return {
                code: s.toString(),
                map: s.generateMap({ hires: 'boundary', source: id })
            };
        },

        // The entry URL is written relative to the chunk that references it, so it resolves against
        // that chunk's own `import.meta.url` whatever `base` or `renderBuiltUrl` say. Vite's
        // `import.meta.ROLLUP_FILE_URL_*` is not used: for relative URLs Vite renders it as a runtime
        // expression, which Rolldown 1.2 corrupts inside alphaTab's main module.
        renderChunk(code, chunk) {
            if (!code.includes(entryPlaceholderPrefix)) {
                return;
            }

            const s = new MagicString(code);
            for (const match of code.matchAll(entryPlaceholderPattern)) {
                const ref = entryReferences[Number(match[1])];
                let url = path.posix.relative(path.posix.dirname(chunk.fileName), this.getFileName(ref));
                if (!url.startsWith('.')) {
                    url = `./${url}`;
                }
                s.update(match.index, match.index + match[0].length, JSON.stringify(url));
            }

            return {
                code: s.toString(),
                map: s.generateMap({ hires: 'boundary' })
            };
        },

        // Emitted chunks count as entries, and frameworks that inject every manifest entry into
        // their pages (e.g. Nuxt) would then run the worker and worklet on the main thread.
        generateBundle(_outputOptions, bundle) {
            for (const index of entriesOf(this.environment)) {
                const output = bundle[this.getFileName(entryReferences[index])];
                if (output?.type === 'chunk') {
                    output.isEntry = false;
                }
            }
        }
    };
}
