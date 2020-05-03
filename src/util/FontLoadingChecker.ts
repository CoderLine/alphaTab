import { IEventEmitterOfT, EventEmitterOfT } from '@src/EventEmitter';
import { Logger } from '@src/util/Logger';
import { Environment } from '@src/Environment';

/**
 * This small utility helps to detect whether a particular font is already loaded.
 * @target web
 */
export class FontLoadingChecker {
    private _family: string;
    private _fallbackText: string;
    private _isStarted: boolean = false;
    public isFontLoaded: boolean = false;

    public fontLoaded: IEventEmitterOfT<string> = new EventEmitterOfT<string>();

    public constructor(family: string, fallbackText: string = 'BESbwy') {
        this._family = family;
        this._fallbackText = fallbackText;
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

        if (Environment.supportsFontsApi) {
            Logger.debug('Font', `[${this._family}] Font API available`);

            let checkFont = () => {
                (document as any).fonts.load(`1em ${this._family}`).then(() => {
                    Logger.debug('Font', `[${this._family}] Font API signaled loaded`);

                    if ((document as any).fonts.check('1em ' + this._family)) {
                        Logger.info('Rendering', `[${this._family}] Font API signaled available`);
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
        } else {
            Logger.debug('Font', `[${this._family}] Font API not available, using resize trick`, null);
            // based on the idea of https://www.bramstein.com/writing/detecting-system-fonts-without-flash.html
            // simply create 3 elements with the 3 default font families and measure them
            // then change to the desired font and expect a change on the width
            let sans: HTMLElement;
            let serif: HTMLElement;
            let monospace: HTMLElement;
            let initialSansWidth: number = -1;
            let initialSerifWidth: number = -1;
            let initialMonospaceWidth: number = -1;
            let checkFont = () => {
                if (!sans) {
                    sans = this.createCheckerElement('sans-serif');
                    serif = this.createCheckerElement('serif');
                    monospace = this.createCheckerElement('monospace');
                    document.body.appendChild(sans);
                    document.body.appendChild(serif);
                    document.body.appendChild(monospace);
                    initialSansWidth = sans.offsetWidth;
                    initialSerifWidth = serif.offsetWidth;
                    initialMonospaceWidth = monospace.offsetWidth;
                    sans.style.fontFamily = `'${this._family}',sans-serif`;
                    serif.style.fontFamily = `'${this._family}',serif`;
                    monospace.style.fontFamily = `'${this._family}',monospace`;
                }
                let sansWidth: number = sans.offsetWidth;
                let serifWidth: number = serif.offsetWidth;
                let monospaceWidth: number = monospace.offsetWidth;
                if (
                    (sansWidth !== initialSansWidth && serifWidth !== initialSerifWidth) ||
                    (sansWidth !== initialSansWidth && monospaceWidth !== initialMonospaceWidth) ||
                    (serifWidth !== initialSerifWidth && monospaceWidth !== initialMonospaceWidth)
                ) {
                    if (sansWidth === serifWidth || sansWidth === monospaceWidth || serifWidth === monospaceWidth) {
                        document.body.removeChild(sans);
                        document.body.removeChild(serif);
                        document.body.removeChild(monospace);
                        this.isFontLoaded = true;
                        window.clearInterval(failCounterId);
                        (this.fontLoaded as EventEmitterOfT<string>).trigger(this._family);
                    } else {
                        window.setTimeout(checkFont, 250);
                    }
                } else {
                    window.setTimeout(checkFont, 250);
                }
            };

            window.addEventListener('DOMContentLoaded', () => {
                checkFont();
            });
        }
    }

    private createCheckerElement(family: string): HTMLElement {
        let checkerElement: HTMLElement = document.createElement('span');
        checkerElement.style.display = 'inline-block';
        checkerElement.style.position = 'absolute';
        checkerElement.style.overflow = 'hidden';
        checkerElement.style.top = '-1000px';
        checkerElement.style.fontSize = '100px';
        checkerElement.style.fontFamily = family;
        checkerElement.innerHTML = this._fallbackText;
        document.body.appendChild(checkerElement);
        return checkerElement;
    }
}
