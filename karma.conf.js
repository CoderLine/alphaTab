const resolve = require("./rollup.resolve");
const commonjs = require("@rollup/plugin-commonjs");

module.exports = function (config) {
  config.set({
    frameworks: ["jasmine"],
    files: [
      { pattern: "dist/lib.test/**/*.test.js", watched: false },
      {
        pattern: "test-data/**/*",
        type: "html",
        watched: false,
        included: false,
        served: true,
        nocache: false,
      },
      {
        pattern: "font/**/*",
        type: "html",
        watched: false,
        included: false,
        served: true,
        nocache: false,
      },
    ],
    preprocessors: {
      "dist/lib.test/**/*.test.js": ["rollup"],
    },
    reporters: ["spec", "kjhtml"],
    browsers: ["ChromeWithUserDataDir"],
    //concurrency: 1,
    singleRun: false,

    client: {
      clearContext: false
    },
    customLaunchers: {
      ChromeWithUserDataDir: {
        base: 'Chrome',
        flags: ['--user-data-dir=./tests/config/.chrome_dev_user']
      }
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
