import { IEventEmitter, IEventEmitterOfT } from '@src/EventEmitter';
import { IContainer } from '@src/platform/IContainer';
import { IMouseEventArgs } from '@src/platform/IMouseEventArgs';
import { BrowserMouseEventArgs } from '@src/platform/javascript/BrowserMouseEventArgs';
import { Lazy } from '@src/util/Lazy';

/**
 * @target web
 */
export class HtmlElementContainer implements IContainer {
    private static resizeObserver: Lazy<ResizeObserver> = new Lazy<ResizeObserver>(() => new ResizeObserver((entries) => {
        for (const e of entries) {
            let evt = new CustomEvent('resize', {
                detail: e
            });
            e.target.dispatchEvent(evt);
        }
    }));

    private _resizeListeners: number = 0;

    public get top(): number {
        return parseFloat(this.element.style.top);
    }

    public set top(value: number) {
        this.element.style.top = value + 'px';
    }

    public get left(): number {
        return parseFloat(this.element.style.top);
    }

    public set left(value: number) {
        this.element.style.left = value + 'px';
    }

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
                this.element.addEventListener(
                    'resize',
                    value,
                    true
                );
                this._resizeListeners++;
            },
            off: (value: any) => {
                this.element.removeEventListener(
                    'resize',
                    value,
                    true
                );
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
        this.element.style.transition = 'all 0s linear';
        this.element.style.transitionDuration = duration + 'ms';
        this.element.style.left = x + 'px';
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
