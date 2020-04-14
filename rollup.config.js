const resolve = require("./rollup.resolve");

module.exports = {
  input: `dist/lib/alphatab.js`,
  output: [
    {
      file: "dist/alphatab.js",
      name: "alphaTab",
      format: "umd",
      sourcemap: false,
      globals: {
        jQuery: "jQuery",
      },
    },
  ],
  external: [],
  watch: {
    include: "dist/lib/**",
    exclude: "node_modules/**",
  },
  plugins: [
    resolve({
      "@src": "dist/lib",
    }),
  ],
};
