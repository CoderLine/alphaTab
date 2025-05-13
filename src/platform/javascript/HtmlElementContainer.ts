import type { IEventEmitter, IEventEmitterOfT } from '@src/EventEmitter';
import type { IContainer } from '@src/platform/IContainer';
import type { IMouseEventArgs } from '@src/platform/IMouseEventArgs';
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
                    const evt = new CustomEvent('resize', {
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
        this.element.style.width = `${value}px`;
    }

    public get scrollLeft(): number {
        return this.element.scrollLeft;
    }

    public set scrollLeft(value: number) {
        this.element.scrollLeft = value;
    }

    public get scrollTop(): number {
        return this.element.scrollTop;
    }

    public set scrollTop(value: number) {
        this.element.scrollTop = value;
    }

    public get height(): number {
        return this.element.offsetHeight;
    }

    public set height(value: number) {
        if (value >= 0) {
            this.element.style.height = `${value}px`;
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
                const nativeListener: (e: MouseEvent) => void = e => {
                    value(new BrowserMouseEventArgs(e));
                };
                this.element.addEventListener('mousedown', nativeListener, true);
                return () => {
                    this.element.removeEventListener('mousedown', nativeListener, true);
                };
            },
            off: (value: any) => {
                // not supported due to wrapping
            }
        };

        this.mouseUp = {
            on: (value: any) => {
                const nativeListener: (e: MouseEvent) => void = e => {
                    value(new BrowserMouseEventArgs(e));
                };

                this.element.addEventListener('mouseup', nativeListener, true);

                return () => {
                    this.element.removeEventListener('mouseup', nativeListener, true);
                };
            },
            off: (value: any) => {
                // not supported due to wrapping
            }
        };

        this.mouseMove = {
            on: (value: any) => {
                const nativeListener: (e: MouseEvent) => void = e => {
                    value(new BrowserMouseEventArgs(e));
                };
                this.element.addEventListener('mousemove', nativeListener, true);

                return () => {
                    this.element.removeEventListener('mousemove', nativeListener, true);
                };
            },
            off: (_: any) => {
                // not supported due to wrapping
            }
        };

        const container = this;
        this.resize = {
            on: function (value: any) {
                if (container._resizeListeners === 0) {
                    HtmlElementContainer.resizeObserver.value.observe(container.element);
                }
                container.element.addEventListener('resize', value, true);
                container._resizeListeners++;

                return () => this.off(value);
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
        this.setBounds(x, Number.NaN, Number.NaN, Number.NaN);
    }

    protected lastBounds: Bounds = new Bounds();

    public setBounds(x: number, y: number, w: number, h: number) {
        if (Number.isNaN(x)) {
            x = this.lastBounds.x;
        }
        if (Number.isNaN(y)) {
            y = this.lastBounds.y;
        }
        if (Number.isNaN(w)) {
            w = this.lastBounds.w;
        }
        if (Number.isNaN(h)) {
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
