/**
 * @public
 */
export interface AlphaTabWebPackPluginOptions {
    /**
     * The location where alphaTab can be found.
     * (default: node_modules/@coderline/alphatab/dist)
     */
    alphaTabSourceDir?: string;

    /**
     * The location where assets of alphaTab should be placed.
     * Set it to false to disable the copying of assets like fonts.
     * (default: compiler.options.output.path)
     */
    assetOutputDir?: string | false;

    /**
     * Whether the plugin bundles alphaTab's audio worklet (the `alphaTabWorklet.addModule()` call)
     * as a worklet entry sharing alphaTab's core chunk with the page.
     * When disabled, audio playback through audio worklets needs to be configured by other means.
     * (default: true)
     */
    audioWorklets?: boolean;

    /**
     * Whether the plugin bundles alphaTab's web worker (the `new Worker(new URL(...))` call) as a worker
     * entry, regardless of the worker parsing the application configured (e.g. Angular disables it).
     * When disabled, alphaTab's worker follows the application's `module.parser.javascript.worker` setting.
     * (default: true)
     */
    webWorkers?: boolean;
}
