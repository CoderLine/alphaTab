import { Environment } from '@src/Environment';
import { LogLevel } from '@src/LogLevel';
import type { BoundsLookup } from './rendering';

/**
 * All main settings of alphaTab controlling rather general aspects of its behavior.
 * @json
 * @json_declaration
 */
export class CoreSettings {
    /**
     * The full URL to the alphaTab JavaScript file.
     * @remarks
     * AlphaTab needs to know the full URL to the script file it is contained in to launch the web workers. AlphaTab will do its best to auto-detect
     * this path but in case it fails, this setting can be used to explicitly define it. Altenatively also a global variable `ALPHATAB_ROOT` can
     * be defined before initializing. Please be aware that bundling alphaTab together with other scripts might cause errors
     * in case those scripts are not suitable for web workers. e.g. if there is a script bundled together with alphaTab that accesses the DOM,
     * this will cause an error when alphaTab starts this script as worker.
     * @defaultValue Absolute url to JavaScript file containing alphaTab. (auto detected)
     * @category Core - JavaScript Specific
     * @target web
     * @since 0.9.6
     */
    public scriptFile: string | null = null;

    /**
     * The full URL to the alphaTab font directory.
     * @remarks
     * AlphaTab will generate some dynamic CSS that is needed for displaying the music symbols correctly. For this it needs to know
     * where the Web Font files of [Bravura](https://github.com/steinbergmedia/bravura) are. Normally alphaTab expects
     * them to be in a `font` subfolder beside the script file. If this is not the case, this setting must be used to configure the path.
     * Alternatively also a global variable `ALPHATAB_FONT` can be set on the page before initializing alphaTab.
     * @defaultValue `${AlphaTabScriptFolder}/font/`
     * @category Core - JavaScript Specific
     * @target web
     * @since 0.9.6
     */
    public fontDirectory: string | null = null;

    /**
     * The full URL to the input file to be loaded.
     * @remarks
     * AlphaTab can automatically load and render a file after initialization. This eliminates the need of manually calling
     * one of the load methods which are available. alphaTab will automatically initiate an `XMLHttpRequest` after initialization
     * to load and display the provided url of this setting. Note that this setting is only interpreted once on initialization.
     * @defaultValue `null`
     * @category Core - JavaScript Specific
     * @target web
     * @since 0.9.6
     */
    public file: string | null = null;

    /**
     * Whether the contents of the DOM element should be loaded as alphaTex.
     * @target web
     * @remarks
     * This setting allows you to fill alphaTex code into the DOM element and make alphaTab automatically
     * load it when initializing. Note that this setting is only interpreted once on initialization.
     * @defaultValue `false`
     * @category Core - JavaScript Specific
     * @since 0.9.6
     * @example
     * JavaScript
     * ```html
     * <div id="alphaTab">\title "Simple alphaTex init" . 3.3*4</div>
     * <script>
     * const api = new alphaTab.AlphaTabApi(document.getElementById('alphaTab'), { core: { tex: true }});
     * </script>
     * ```
     */
    public tex: boolean = false;

    /**
     * The tracks to display for the initally loaded file.
     * @json_raw
     * @remarks
     * This setting can be used in combinition with the {@link file} or {@link tex} option. It controls which of the tracks
     * of the initially loaded file should be displayed.
     * @defaultValue `null`
     * @category Core - JavaScript Specific
     * @target web
     * @since 0.9.6
     */
    public tracks: number | number[] | 'all' | null = null;

    /**
     * Enables lazy loading of the rendered music sheet chunks.
     * @remarks
     * AlphaTab renders the music sheet in smaller sub-chunks to have fast UI feedback. Not all of those sub-chunks are immediately
     * appended to the DOM due to performance reasons. AlphaTab tries to detect which elements are visible on the screen, and only
     * appends those elements to the DOM. This reduces the load of the browser heavily but is not working for all layouts and use cases.
     * This setting set to false, ensures that all rendered items are instantly appended to the DOM.
     * @defaultValue `true`
     * @category Core - JavaScript Specific
     * @target web
     * @since 0.9.6
     */
    public enableLazyLoading: boolean = true;

    /**
     * The engine which should be used to render the the tablature.
     * @remarks
     * AlphaTab can use various render engines to draw the music notation. The available render engines is specific to the platform. Please refer to the table below to find out which engines are available on which platform.
     * - `default`- Platform specific default engine
     * - `html5`- Uses HTML5 canvas elements to render the music notation (browser only)
     * - `svg`- Outputs SVG strings (all platforms, default for web)
     * - `skia` - Uses [Skia](https://skia.org/) for rendering (all non-browser platforms via [alphaSkia](https://github.com/CoderLine/alphaSkia), default for non-web)
     * - `gdi` - Uses [GDI+](https://docs.microsoft.com/en-us/dotnet/framework/winforms/advanced/graphics-and-drawing-in-windows-forms) for rendering (only on .net)
     * - `android` - Uses [android.graphics.Canvas](https://developer.android.com/reference/android/graphics/Canvas) for rendering (only on Android)
     * @defaultValue `default`
     * @category Core
     * @since 0.9.6
     */
    public engine: string = 'default';

    /**
     * The log level to use within alphaTab
     * @remarks
     * AlphaTab internally does quite a bit of logging for debugging and informational purposes. The log level of alphaTab can be controlled via this setting.
     * @defaultValue `LogLevel.Info`
     * @category Core
     * @since 0.9.6
     */
    public logLevel: LogLevel = LogLevel.Info;

    /**
     * Whether the rendering should be done in a worker if possible.
     * @remarks
     * AlphaTab normally tries to render the music sheet asynchronously in a worker. This reduces the load on the UI side and avoids hanging. However sometimes it might be more desirable to have
     * a synchronous rendering behavior. This setting can be set to false to synchronously render the music sheet on the UI side.
     * @defaultValue `true`
     * @category Core
     * @since 0.9.6
     */
    public useWorkers: boolean = true;

    /**
     * Whether in the {@link BoundsLookup} also the position and area of each individual note is provided.
     * @remarks
     * AlphaTab collects the position of the rendered music notation elements during the rendering process. This way some level of interactivity can be provided like the feature that seeks to the corresponding position when clicking on a beat.
     * By default the position of the individual notes is not collected due to performance reasons. If access to note position information is needed, this setting can enable it.
     * @defaultValue `false`
     * @category Core
     * @since 0.9.6
     * @example
     * JavaScript
     * ```js
     * const settings = new alphaTab.model.Settings();
     * settings.core.includeNoteBounds = true;
     * const api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'), settings);
     * api.renderFinished.on(() => {
     *     const lookup = api.renderer.boundsLookup;
     *     const x = 100;
     *     const y = 100;
     *     const beat = lookup.getBeatAtPos(x, y);
     *     const note = lookup.getNoteAtPos(beat, x, y);
     * });
     * ```
     */
    public includeNoteBounds: boolean = false;

    /**
     * @target web
     */
    public constructor() {
        this.scriptFile = Environment.scriptFile;
        this.fontDirectory = Environment.fontDirectory;
    }
}
