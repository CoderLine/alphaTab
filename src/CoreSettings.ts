import { Environment } from '@src/Environment';
import { LogLevel } from '@src/LogLevel';

/**
 * @json
 * @json_declaration
 */
export class CoreSettings {
    /**
     * AlphaTab needs to know the full URL to the script file it is contained in to launch the web workers. AlphaTab will do its best to auto-detect
     * this path but in case it fails, this setting can be used to explicitly define it. Altenatively also a global variable `ALPHATAB_ROOT` can
     * be defined before initializing. Please be aware that bundling alphaTab together with other scripts might cause errors
     * in case those scripts are not suitable for web workers. e.g. if there is a script bundled together with alphaTab that accesses the DOM,
     * this will cause an error when alphaTab starts this script as worker.
     * @target web
     * @since 0.9.6
     * @default automatic
     */
    public scriptFile: string | null = null;

    /**
     * AlphaTab will generate some dynamic CSS that is needed for displaying the music symbols correctly. For this it needs to know
     * where the Web Font files of [Bravura](https://github.com/steinbergmedia/bravura) are. Normally alphaTab expects
     * them to be in a `font` subfolder beside the script file. If this is not the case, this setting must be used to configure the path.
     * Alternatively also a global variable `ALPHATAB_FONT` can be set on the page before initializing alphaTab.
     * @target web
     * @since 0.9.6
     * @default automatic
     */
    public fontDirectory: string | null = null;

    /**
     * AlphaTab can automatically load and render a file after initialization. This eliminates the need of manually calling
     * one of the load methods which are available. alphaTab will automatically initiate an `XMLHttpRequest` after initialization
     * to load and display the provided url of this setting. Note that this setting is only interpreted once on initialization.
     * @target web
     * @since 0.9.6
     * @default null
     */
    public file: string | null = null;

    /**
     * This setting allows you to fill alphaTex code into the DOM element and make alphaTab automatically
     * load it when initializing. Note that this setting is only interpreted once on initialization.
     * @target web
     * @since 0.9.6
     * @example web
     * ```html
     * <div id="alphaTab">\title "Simple alphaTex init" . 3.3*4</div>
     * <script>
     * const api = new alphaTab.AlphaTabApi(document.getElementById('alphaTab'), { core: { tex: true } });
     * </script>
     * ```
     * @default false
     */
    public tex: boolean = false;

    /**
     * This setting can be used in combinition with the `file` or `tex` option. It controls which of the tracks
     * of the initially loaded file should be displayed.
     * @target web
     * @since 0.9.6
     * @json_raw
     * @default null
     */
    public tracks: number | number[] | 'all' | null = null;

    /**
     * AlphaTab renders the music sheet in smaller sub-chunks to have fast UI feedback. Not all of those sub-chunks are immediately
     * appended to the DOM due to performance reasons. AlphaTab tries to detect which elements are visible on the screen, and only
     * appends those elements to the DOM. This reduces the load of the browser heavily but is not working for all layouts and use cases.
     * This setting set to false, ensures that all rendered items are instantly appended to the DOM.#
     * @since 0.9.6
     * @default true
     */
    public enableLazyLoading: boolean = true;

    /**
     * AlphaTab can use various render engines to draw the music notation. The available render engines are specific to the platform.
     *
     * | Type      | Values                                                                  | Available On Platform    |
     * |-----------|-------------------------------------------------------------------------|--------------------------|
     * | `default` | Platform specific default engine (`svg` for web, `skia` for others)     | all                      |
     * | `html5`   | Uses HTML5 canvas elements to render the music notation.                | `web`                    |
     * | `skia`    | Uses alphaSkia (a cross platform Skia wrapper) to render music notation | `net`, `android`, `node` |
     * @since 0.9.6
     * @default 'default'
     */
    public engine: string = 'default';

    /**
     * AlphaTab internally does quite a bit of logging for debugging and informational purposes.
     * The log level of alphaTab can be controlled via this setting.
     * @since 0.9.6
     * @default LogLevel.Info
     */
    public logLevel: LogLevel = LogLevel.Info;

    /**
     * AlphaTab normally tries to render the music sheet asynchronously in a worker. 
     * This reduces the load on the UI side and avoids hanging. However sometimes it might be more desirable to have
     * a synchronous rendering behavior. This setting can be set to false to synchronously render the music sheet on the UI side.
     * @since 0.9.6
     * @default true
     */
    public useWorkers: boolean = true;

    /**
     * AlphaTab collects the position of the rendered music notation elements during the rendering process.
     * This way some level of interactivity can be provided like the feature that seeks to the corresponding position when clicking on a beat.
     * By default the position of the individual notes is not collected due to performance reasons.
     * If access to note position information is needed, this setting can enable it.
     * @since 0.9.6
     * @example web
     * ```js
     * const settings = {
     *      core: {
     *          includeNoteBounds: true
     *      }
     *  };
     *  let api = new alphaTab.AlphaTabApi(document.querySelector('#alphaTab'), settings);
     *  api.renderFinished.on(function() {
     *      var lookup = api.renderer.boundsLookup;
     *      var x = 100;
     *      var y = 100;
     *      var beat = lookup.getBeatAtPos(x, y);
     *      var note = lookup.getNoteAtPos(beat, x, y);
     *  });
     * ```
     * @default false
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
