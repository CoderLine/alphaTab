import fs from 'node:fs';
import path from 'node:path';
import type { OutputPlugin } from 'rollup';
import { type MinifyOptions, minify } from 'terser';

const minFileName = (file: string) => file.replace('.mjs', '.min.mjs').replace('.js', '.min.js');

/**
 * Points the relative references of a minified entry (`import './x.mjs'`, `new URL('./x.mjs', ...)`)
 * at the minified variants of the other entries, so a `.min` file only loads `.min` files.
 */
function referenceMinifiedEntries(code: string, entryFiles: string[]): string {
    let result = code;
    for (const entry of entryFiles) {
        const escaped = entry.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        result = result.replace(new RegExp(`(['"\`])\\./${escaped}\\1`, 'g'), (_, quote) => `${quote}./${minFileName(entry)}${quote}`);
    }
    return result;
}

export default function min(options: MinifyOptions): OutputPlugin {
    return {
        name: 'min',
        async writeBundle(opts, bundle) {
            const files = Object.keys(bundle);
            const entryFiles = files.filter(file => {
                const chunk = bundle[file];
                return (file.endsWith('.mjs') || file.endsWith('.js')) && chunk.type === 'chunk' && chunk.isEntry;
            });

            for (const file of files) {
                const chunk = bundle[file];
                if ((file.endsWith('.mjs') || file.endsWith('.js')) && chunk.type === 'chunk' && chunk.isEntry) {
                    this.info(`Creating min file for bundle ${file}`);

                    const o = { ...options };
                    if (opts.format === 'es') {
                        o.module = true;
                    } else if (opts.format === 'cjs') {
                        o.toplevel = true;
                    }

                    const min = await minify(referenceMinifiedEntries(chunk.code, entryFiles), o);
                    const outputFile = path.resolve(opts.dir!, minFileName(file));
                    await fs.promises.writeFile(outputFile, min.code!);
                }
            }
        }
    };
}
