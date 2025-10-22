import fs from 'node:fs';
import path from 'node:path';
import type { OutputPlugin } from 'rollup';
import { type MinifyOptions, minify } from 'terser';

export default function min(options: MinifyOptions): OutputPlugin {
    return {
        name: 'min',
        async writeBundle(opts, bundle) {
            const files = Object.keys(bundle);

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

                    const min = await minify(chunk.code, o);
                    const outputFile = path.resolve(
                        opts.dir!,
                        file.replace('.mjs', '.min.mjs').replace('.js', '.min.js')
                    );
                    await fs.promises.writeFile(outputFile, min.code!);
                }
            }
        }
    };
}
