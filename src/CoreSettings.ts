import { Environment } from '@src/Environment';
import { LogLevel } from '@src/LogLevel';

/**
 * @json
 */
export class CoreSettings {
    /**
     * Gets or sets the script file url that will be used to spawn the workers.
     * @target web
     */
    public scriptFile: string | null = null;

    /**
     * Gets or sets the url to the fonts that will be used to generate the alphaTab font style.
     * @target web
     */
    public fontDirectory: string | null = null;

    /**
     * Gets or sets the file to load directly after initializing alphaTab.
     * @target web
     */
    public file: string | null = null;

    /**
     * Gets or sets whether the UI element contains alphaTex code that should be
     * used to initialize alphaTab.
     * @target web
     */
    public tex: boolean = false;

    /**
     * Gets or sets the initial tracks that should be loaded for the score. 
     * @target web
     */
    public tracks: unknown = null;

    /**
     * Gets or sets whether lazy loading for displayed elements is enabled.
     */
    public enableLazyLoading: boolean = true;

    /**
     * The engine which should be used to render the the tablature.
     *
     * - **default**- Platform specific default engine
     * - **html5**- HTML5 Canvas
     * - **svg**- SVG
     */
    public engine: string = 'default';

    /**
     * The log level to use within alphaTab
     */
    public logLevel: LogLevel = LogLevel.Info;

    /**
     * Gets or sets whether the rendering should be done in a worker if possible.
     */
    public useWorkers: boolean = true;

    /**
     * Gets or sets whether in the {@link BoundsLookup} also the
     * position and area of each individual note is provided.
     */
    public includeNoteBounds: boolean = false;

    /**
     * @target web
     */
    public constructor() {
        if (!Environment.isRunningInWorker && Environment.globalThis.ALPHATAB_ROOT) {
            this.scriptFile = Environment.globalThis.ALPHATAB_ROOT;
            this.scriptFile = CoreSettings.ensureFullUrl(this.scriptFile);
            this.scriptFile = CoreSettings.appendScriptName(this.scriptFile);
        } else {
            this.scriptFile = Environment.scriptFile;
        }

        if (!Environment.isRunningInWorker && Environment.globalThis.ALPHATAB_FONT) {
            this.fontDirectory = Environment.globalThis['ALPHATAB_FONT'];
            this.fontDirectory = CoreSettings.ensureFullUrl(this.fontDirectory);
        } else {
            this.fontDirectory = this.scriptFile;
            if (this.fontDirectory) {
                let lastSlash: number = this.fontDirectory.lastIndexOf(String.fromCharCode(47));
                if (lastSlash >= 0) {
                    this.fontDirectory = this.fontDirectory.substr(0, lastSlash) + '/font/';
                }
            }
        }
    }

    /**
     * @target web
     */
    public static ensureFullUrl(relativeUrl: string | null): string {
        if(!relativeUrl) {
            return '';
        }

        if (!relativeUrl.startsWith('http') && !relativeUrl.startsWith('https') && !relativeUrl.startsWith('file')) {
            let root: string = '';
            let location: Location = Environment.globalThis['location'];
            root += location.protocol?.toString();
            root += '//'?.toString();
            if (location.hostname) {
                root += location.hostname?.toString();
            }
            if (location.port) {
                root += ':'?.toString();
                root += location.port?.toString();
            }
            // as it is not clearly defined how slashes are treated in the location object
            // better be safe than sorry here
            if (!relativeUrl.startsWith('/')) {
                let directory: string = location.pathname.split('/').slice(0, -1).join('/');
                if (directory.length > 0) {
                    if (!directory.startsWith('/')) {
                        root += '/'?.toString();
                    }
                    root += directory?.toString();
                }
            }
            if (!relativeUrl.startsWith('/')) {
                root += '/'?.toString();
            }
            root += relativeUrl?.toString();
            return root;
        }
        return relativeUrl;
    }

    private static appendScriptName(url: string): string {
        // append script name
        if (url && !url.endsWith('.js')) {
            if (!url.endsWith('/')) {
                url += '/';
            }
            url += 'alphaTab.js';
        }
        return url;
    }
}
