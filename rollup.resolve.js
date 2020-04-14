const join = require('path').join;
const glob = require('glob').sync;

module.exports = function (mappings) {
    return {
        name: 'resolve-typescript-paths',
        resolveId: function (importee, importer) {
            if (typeof importer === 'undefined' || importee.startsWith('\0')) {
                return null;
            }

            if (importee.startsWith('**')) {
                return importee;
            } else {
                const match = Object.entries(mappings).filter(m => importee.startsWith(m[0]));
                if (!match || match.length === 0) {
                    return null;
                }

                if (match[0][1].endsWith('.js')) {
                    return join(process.cwd(), match[0][1]);
                }

                const resolved = join(process.cwd(), match[0][1], importee.substring(match[0][0].length) + '.js');
                return resolved;
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
