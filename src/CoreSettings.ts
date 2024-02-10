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
        this.scriptFile = Environment.scriptFile;
        this.fontDirectory = Environment.fontDirectory;
    }
}
