import path from 'path';
import glob from 'glob';
import fs from 'fs';
import { Plugin } from 'rollup';

export interface ResolvePluginOptions {
    mappings: {
        [key: string]: string
    },
    types?: boolean
}

export default function resolve(options: ResolvePluginOptions) {
    const mappings = options.mappings;
    const types = options.types;

    return {
        name: 'resolve-typescript-paths',
        resolveId: function (importee, importer) {
            if (typeof importer === 'undefined' || importee.startsWith('\0')) {
                return null;
            }

            const extension = types ? '.d.ts' : '.js';

            if (fs.existsSync(importee)) {
                return importee;
            } else if (importee.startsWith('**')) {
                return importee;
            } else {
                const importerDir = path.dirname(importer);
                let resolved = importee;

                let match = Object.entries(mappings).filter(m => importee.startsWith(m[0]));
                if (match && match.length > 0) {
                    if (match[0][1].endsWith(extension)) {
                        resolved = path.join(process.cwd(), match[0][1]);
                    } else {
                        resolved = path.join(process.cwd(), match[0][1], importee.substring(match[0][0].length));
                    }
                } else {
                    resolved = path.join(importerDir, importee);
                }

                if (fs.existsSync(path.join(resolved, 'index' + extension))) {
                    resolved = path.join(resolved, 'index');
                }

                resolved += extension;
                if (fs.existsSync(resolved)) {
                    return resolved;
                }

                return null;
            }
        },
        load(id) {
            if (id.startsWith('**')) {
                const files = glob.sync(id, {
                    cwd: process.cwd()
                });
                const source = files
                    .map((file, i) => `export * as _${i} from ${JSON.stringify(path.join(process.cwd(), file))};`)
                    .join('\r\n');
                return source;
            }
            return null;
        }
    } as Plugin;
};
