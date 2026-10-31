# alphaTab WebPack Plugin

This is the plugin for bundling [alphaTab](https://alphatab.net/) correctly in your WebPack powered projects. The same plugin works with [Rspack](https://rspack.rs/).

alphaTab internally off-loads some work to background workers to not block the browser while rendering or generating audio. These background workers are realized through Web Workers and Audio Worklets. This plugin ensures WebPack correctly bundles alphaTab by:

* Ensures the Web Font (Bravura) and the SoundFont (SONiVOX) shipped with alphaTab are copied to the build output and made available through <root>/font/ and <root>/soundfont/ of your application.
* Bundles alphaTab's Web Worker and Audio Worklet as worker entries, also when the application disabled worker parsing (as Angular does). This applies to alphaTab's modules only; the parser settings of your own code stay untouched.
* Lets the page, the Web Workers and the Audio Worklet load one shared chunk with alphaTab's core instead of a copy each. An Audio Worklet cannot load chunks on its own, so the plugin tells alphaTab which chunks to add to the worklet before its entry.

## Optimization settings

Sharing the core chunk needs two optimization settings, which the plugin configures:

* `optimization.usedExports` is set to `'global'` unless configured. With `true` (webpack's production default), the used exports get optimized per runtime and the core is bundled once for the page and once more for the workers; the plugin reports a warning in that case.
* A `splitChunks` cache group `alphaTabCore` moves alphaTab's core module into its own chunk shared by all runtimes. Other cache groups and the `splitChunks` defaults stay as configured. With `optimization.splitChunks: false`, no chunk is shared and every runtime includes its own copy of the core.

See https://alphatab.net/docs/getting-started/installation-webpack for more details.
