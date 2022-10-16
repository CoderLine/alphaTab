const path = require('path');
const glob = require('glob').sync;
const fs = require('fs');

module.exports = function (options) {
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

                const match = Object.entries(mappings).filter(m => importee.startsWith(m[0]));
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

                return resolved + extension;
            }
        },
        load(id) {
            if (id.startsWith('**')) {
                const files = glob(id, {
                    cwd: process.cwd()
                });
                const source = files
                    .map((file, i) => `export * as _${i} from ${JSON.stringify(path.join(process.cwd(), file))};`)
                    .join('\r\n');
                return source;
            }
            return null;
        }
    };
};
