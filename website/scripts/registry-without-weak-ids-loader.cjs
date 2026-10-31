// Dev-only loader for Docusaurus' generated `.docusaurus/registry.js`. Each route entry
// carries `require.resolveWeak(modulePath)` next to its `import()`; webpack builds every
// weakly referenced module to assign its id, so all ~750 page modules would compile at
// startup despite lazy compilation. The id only lets react-loadable render a route
// synchronously while hydrating server-rendered HTML, which the dev server never serves.
module.exports = function registryWithoutWeakIds(source) {
  return source.replace(/require\.resolveWeak\("[^"]*"\)/g, "undefined");
};
