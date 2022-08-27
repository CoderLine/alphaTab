import { IEventEmitterOfT, EventEmitterOfT } from '@src/EventEmitter';
import { Logger } from '@src/Logger';
import { Environment } from '@src/Environment';

/**
 * This small utility helps to detect whether a particular font is already loaded.
 * @target web
 */
export class FontLoadingChecker {
    private _originalFamilies: string[];
    private _families: string[];

    private _isStarted: boolean = false;
    public isFontLoaded: boolean = false;

    public fontLoaded: IEventEmitterOfT<string> = new EventEmitterOfT<string>();

    public constructor(families: string[]) {
        this._originalFamilies = families;
        this._families = families;
    }

    public checkForFontAvailability(): void {
        if (Environment.isRunningInWorker) {
            // no web fonts in web worker
            this.isFontLoaded = false;
            return;
        }

        if (this._isStarted) {
            return;
        }

        this._isStarted = true;
        let failCounter: number = 0;
        let failCounterId: number = window.setInterval(() => {
            Logger.warning(
                'Rendering',
                `Could not load font '${this._families[0]}' within ${(failCounter + 1) * 5} seconds`,
                null
            );

            // try loading next font if there are more than 1 left
            if (this._families.length > 1) {
                this._families.shift();
                failCounter = 0;
            } else {
                failCounter++;
            }

        }, 5000);

        Logger.debug('Font', `Start checking for font availablility: ${this._families.join(', ')}`);

        let errorHandler = () => {
            if (this._families.length > 1) {
                Logger.debug('Font', `[${this._families[0]}] Loading Failed, switching to ${this._families[1]}`);
                this._families.shift();
                window.setTimeout(() => {
                    checkFont();
                }, 0);
            }
            else {
                Logger.error('Font', `[${this._originalFamilies.join(',')}] Loading Failed, rendering cannot start`);
                window.clearInterval(failCounterId);
            }
        };

        let successHandler = (font:string) => {
            Logger.debug('Rendering', `[${font}] Font API signaled available`);
            this.isFontLoaded = true;
            window.clearInterval(failCounterId);
            (this.fontLoaded as EventEmitterOfT<string>).trigger(this._families[0]);
        };

        let checkFont = () => {
            // Fast Path: check if one of the specified fonts is already available.
            for (const font of this._families) {
                if ((document as any).fonts.check('1em ' + font)) {
                    successHandler(font);
                    return;
                }
            }

            // Slow path: Wait for fonts to be loaded sequentially
            const promise: Promise<FontFace[]> = (document as any).fonts.load(`1em ${this._families[0]}`);
            promise.then(
                () => {
                    Logger.debug('Font', `[${this._families[0]}] Font API signaled loaded`);
                    if ((document as any).fonts.check('1em ' + this._families[0])) {
                        successHandler(this._families[0]);
                    } else {
                        errorHandler();
                    }
                    return true;
                },
                reason => {
                    errorHandler();
                });
        };


        (document as any).fonts.ready.then(() => {
            checkFont();
        });
    }
}
