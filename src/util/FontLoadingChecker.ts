import { IEventEmitterOfT, EventEmitterOfT } from '@src/EventEmitter';
import { Logger } from '@src/Logger';
import { Environment } from '@src/Environment';

/**
 * This small utility helps to detect whether a particular font is already loaded.
 * @target web
 */
export class FontLoadingChecker {
    private _family: string;
    private _isStarted: boolean = false;
    public isFontLoaded: boolean = false;

    public fontLoaded: IEventEmitterOfT<string> = new EventEmitterOfT<string>();

    public constructor(family: string) {
        this._family = family;
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
            failCounter++;
            Logger.warning(
                'Rendering',
                `Could not load font '${this._family}' within ${failCounter * 5} seconds`,
                null
            );
        }, 5000);

        Logger.debug('Font', `Start checking for font availablility: ${this._family}`);

        Logger.debug('Font', `[${this._family}] Font API available`);

        let checkFont = () => {
            (document as any).fonts.load(`1em ${this._family}`).then(() => {
                Logger.debug('Font', `[${this._family}] Font API signaled loaded`);

                if ((document as any).fonts.check('1em ' + this._family)) {
                    Logger.debug('Rendering', `[${this._family}] Font API signaled available`);
                    this.isFontLoaded = true;
                    window.clearInterval(failCounterId);
                    (this.fontLoaded as EventEmitterOfT<string>).trigger(this._family);
                } else {
                    Logger.debug(
                        'Font',
                        `[${this._family}] Font API loaded reported, but font not available, checking later again`,
                        null
                    );
                    window.setTimeout(() => {
                        checkFont();
                    }, 250);
                }
                return true;
            });
        };
        checkFont();
    }
}
