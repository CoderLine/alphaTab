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

        let errorHandler = (e: unknown) => {
            if (this._families.length > 1) {
                Logger.debug('Font', `[${this._families[0]}] Loading Failed, switching to ${this._families[1]}`, e);
                this._families.shift();
                window.setTimeout(() => {
                    // tslint:disable-next-line: no-floating-promises
                    checkFont();
                }, 0);
            } else {
                Logger.error('Font', `[${this._originalFamilies.join(',')}] Loading Failed, rendering cannot start`, e);
                window.clearInterval(failCounterId);
                debugger;
            }
        };

        let successHandler = (font: string) => {
            Logger.debug('Font', `[${font}] Font API signaled available`);
            this.isFontLoaded = true;
            window.clearInterval(failCounterId);
            (this.fontLoaded as EventEmitterOfT<string>).trigger(this._families[0]);
        };

        let checkFont = async () => {
            // Fast Path: check if one of the specified fonts is already available.
            for (const font of this._families) {
                if (await this.isFontAvailable(font, false)) {
                    successHandler(font);
                    return;
                }
            }

            // Slow path: Wait for fonts to be loaded sequentially
            try {
                await (document as any).fonts.load(`1em ${this._families[0]}`);
            } catch (e) {
                errorHandler(e);
            }

            Logger.debug('Font', `[${this._families[0]}] Font API signaled loaded`);
            if (await this.isFontAvailable(this._families[0], true)) {
                successHandler(this._families[0]);
            } else {
                errorHandler('Font not available');
            }
            return true;
        };

        (document as any).fonts.ready.then(() => {
            // tslint:disable-next-line: no-floating-promises
            checkFont();
        });
    }

    private isFontAvailable(family: string, advancedCheck: boolean): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            // In some very rare occasions Chrome reports false for the font.
            // in this case we try to force some refresh and reload by creating an element with this font.
            const fontString = '1em ' + family;
            if ((document as any).fonts.check(fontString)) {
                resolve(true);
            } else if (advancedCheck) {
                Logger.debug('Font', `Font ${family} not available, creating test element to trigger load`);
                const testElement = document.createElement('div');
                testElement.style.font = fontString;
                testElement.style.opacity = '0';
                testElement.style.position = 'absolute';
                testElement.style.top = '0';
                testElement.style.left = '0';
                testElement.innerText = `Trigger ${family} load`;
                document.body.appendChild(testElement);
                setTimeout(() => {
                    document.body.removeChild(testElement);
                    if ((document as any).fonts.check(fontString)) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }, 200);
            } else {
                resolve(false);
            }
        });
    }
}
