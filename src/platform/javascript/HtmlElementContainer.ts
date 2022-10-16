import { IEventEmitter, IEventEmitterOfT } from '@src/EventEmitter';
import { IContainer } from '@src/platform/IContainer';
import { IMouseEventArgs } from '@src/platform/IMouseEventArgs';
import { BrowserMouseEventArgs } from '@src/platform/javascript/BrowserMouseEventArgs';
import { Bounds } from '@src/rendering/utils/Bounds';
import { Lazy } from '@src/util/Lazy';

/**
 * @target web
 */
export class HtmlElementContainer implements IContainer {
    private static resizeObserver: Lazy<ResizeObserver> = new Lazy<ResizeObserver>(
        () =>
            new ResizeObserver((entries: ResizeObserverEntry[]) => {
                for (const e of entries) {
                    let evt = new CustomEvent('resize', {
                        detail: e
                    });
                    e.target.dispatchEvent(evt);
                }
            })
    );

    private _resizeListeners: number = 0;

    public get width(): number {
        return this.element.offsetWidth;
    }

    public set width(value: number) {
        this.element.style.width = value + 'px';
    }

    public get scrollLeft(): number {
        return this.element.scrollLeft;
    }

    public set scrollLeft(value: number) {
        this.element.scrollTop = value;
    }

    public get scrollTop(): number {
        return this.element.scrollLeft;
    }

    public set scrollTop(value: number) {
        this.element.scrollTop = value;
    }

    public get height(): number {
        return this.element.offsetHeight;
    }

    public set height(value: number) {
        if (value >= 0) {
            this.element.style.height = value + 'px';
        } else {
            this.element.style.height = '100%';
        }
    }

    public get isVisible(): boolean {
        return !!this.element.offsetWidth || !!this.element.offsetHeight || !!this.element.getClientRects().length;
    }

    public readonly element: HTMLElement;

    public constructor(element: HTMLElement) {
        this.element = element;

        this.mouseDown = {
            on: (value: any) => {
                this.element.addEventListener(
                    'mousedown',
                    e => {
                        value(new BrowserMouseEventArgs(e));
                    },
                    true
                );
            },
            off: (value: any) => {
                // not supported due to wrapping
            }
        };

        this.mouseUp = {
            on: (value: any) => {
                this.element.addEventListener(
                    'mouseup',
                    e => {
                        value(new BrowserMouseEventArgs(e));
                    },
                    true
                );
            },
            off: (value: any) => {
                // not supported due to wrapping
            }
        };

        this.mouseMove = {
            on: (value: any) => {
                this.element.addEventListener(
                    'mousemove',
                    e => {
                        value(new BrowserMouseEventArgs(e));
                    },
                    true
                );
            },
            off: (_: any) => {
                // not supported due to wrapping
            }
        };

        this.resize = {
            on: (value: any) => {
                if (this._resizeListeners === 0) {
                    HtmlElementContainer.resizeObserver.value.observe(this.element);
                }
                this.element.addEventListener('resize', value, true);
                this._resizeListeners++;
            },
            off: (value: any) => {
                this.element.removeEventListener('resize', value, true);
                this._resizeListeners--;
                if (this._resizeListeners <= 0) {
                    this._resizeListeners = 0;
                    HtmlElementContainer.resizeObserver.value.unobserve(this.element);
                }
            }
        };
    }

    public stopAnimation(): void {
        this.element.style.transition = 'none';
    }

    public transitionToX(duration: number, x: number): void {
        this.element.style.transition = `transform ${duration}ms linear`;
        this.setBounds(x, NaN, NaN, NaN);
    }

    protected lastBounds: Bounds = new Bounds();

    public setBounds(x: number, y: number, w: number, h: number) {
        if (isNaN(x)) {
            x = this.lastBounds.x;
        }
        if (isNaN(y)) {
            y = this.lastBounds.y;
        }
        if (isNaN(w)) {
            w = this.lastBounds.w;
        }
        if (isNaN(h)) {
            h = this.lastBounds.h;
        }
        this.element.style.transform = `translate(${x}px, ${y}px) scale(${w}, ${h})`;
        this.element.style.transformOrigin = 'top left';
        this.lastBounds.x = x;
        this.lastBounds.y = y;
        this.lastBounds.w = w;
        this.lastBounds.h = h;
    }

    /**
     * This event occurs when the control was resized.
     */
    public resize: IEventEmitter;

    /**
     * This event occurs when a mouse/finger press happened on the control.
     */
    public mouseDown: IEventEmitterOfT<IMouseEventArgs>;

    /**
     * This event occurs when a mouse/finger moves on top of the control.
     */
    public mouseMove: IEventEmitterOfT<IMouseEventArgs>;

    /**
     * This event occurs when a mouse/finger is released from the control.
     */
    public mouseUp: IEventEmitterOfT<IMouseEventArgs>;

    public appendChild(child: IContainer): void {
        this.element.appendChild((child as HtmlElementContainer).element);
    }

    public clear(): void {
        this.element.innerHTML = '';
    }
}
