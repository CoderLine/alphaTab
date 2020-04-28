const resolve = require("./rollup.resolve");
const commonjs = require("@rollup/plugin-commonjs");

module.exports = function (config) {
  config.set({
    frameworks: ["jasmine"],
    files: [
      { pattern: "dist/lib.test/test/index.js", watched: false },
      {
        pattern: "test-data/**/*",
        type: "html",
        watched: false,
        included: false,
        served: true,
        nocache: true,
      },
      {
        pattern: "font/**/*",
        type: "html",
        watched: false,
        included: false,
        served: true,
        nocache: true,
      },
    ],
    preprocessors: {
      "dist/lib.test/test/index.js": ["rollup"],
    },

    client: {
      clearContext: false
    },

    rollupPreprocessor: {
      plugins: [
        resolve({
          "pixelmatch": "node_modules/pixelmatch/index.js",
          "@src": "dist/lib.test/src",
          "@test": "dist/lib.test/test",
        }),
        commonjs(),
      ],
      output: {
        format: "iife",
        name: "alphaTab",
        sourcemap: false,
      },
    },
  });
};
