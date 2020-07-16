const join = require('path').join;
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

            if (importee.startsWith('**')) {
                return importee;
            } else {
                const match = Object.entries(mappings).filter(m => importee.startsWith(m[0]));
                if (!match || match.length === 0) {
                    return null;
                }

                if (match[0][1].endsWith(extension)) {
                    return join(process.cwd(), match[0][1]);
                }

                let resolved = join(process.cwd(), match[0][1], importee.substring(match[0][0].length));
                if (fs.existsSync(join(resolved, 'index' + extension))) {
                    return join(resolved, 'index' + extension);
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
                    .map(
                        (file, i) =>
                            `import _${i} from ${JSON.stringify(join(process.cwd(), file))}; 
                            export { _${i} };`
                    )
                    .join('\r\n');
                return source;
            }
            return null;
        }
    };
};
