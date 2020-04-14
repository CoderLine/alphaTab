const { join } = require("path");
const { sys } = require("typescript");

module.exports = function (mappings) {
  return {
    name: "resolve-typescript-paths",
    resolveId: function (importee, importer) {
      if (typeof importer === "undefined" || importee.startsWith("\0")) {
        return null;
      }

      const match = Object.entries(mappings).filter((m) => importee.startsWith(m[0]));
      if (!match || match.length===0) {
        return null;
      }

      if(match[0][1].endsWith(".js")) {
        return join(sys.getCurrentDirectory(), match[0][1]);
      }

      const resolved = join(sys.getCurrentDirectory(), match[0][1], importee.substring(match[0][0].length) + ".js");
      return resolved;
    },
  };
};
