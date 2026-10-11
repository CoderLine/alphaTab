import { EventEmitterOfT, type IEventEmitter, type IEventEmitterOfT } from '@coderline/alphatab/EventEmitter';
import type { IContainer } from '@coderline/alphatab/platform/IContainer';
import type { IMouseEventArgs } from '@coderline/alphatab/platform/IMouseEventArgs';
import { BrowserMouseEventArgs } from '@coderline/alphatab/platform/javascript/BrowserMouseEventArgs';
import { Bounds } from '@coderline/alphatab/rendering/utils/Bounds';
import { Lazy } from '@coderline/alphatab/util/Lazy';

/**
 * A UI element implementation wrapping HTML elements.
 * @target web
 * @public
 */
export interface IHtmlElementContainer extends IContainer{
    /**
     * The wrapped UI element.
     */
    readonly element:HTMLElement;
}

/**
 * @target web
 * @internal
 */
export class HtmlElementContainer implements IHtmlElementContainer {
    private static _resizeObserver: Lazy<ResizeObserver> = new Lazy<ResizeObserver>(
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

        this.mouseDown = this._createMouseEmitter(this._mouseDown);
        this.mouseMove = this._createMouseEmitter(this._mouseMove);
        this.mouseUp = this._createMouseEmitter(this._mouseUp);

        const container = this;
        this.resize = {
            on: function (value: any) {
                if (container._resizeListeners === 0) {
                    HtmlElementContainer._resizeObserver.value.observe(container.element);
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
                    HtmlElementContainer._resizeObserver.value.unobserve(this.element);
                }
            }
        };
    }

    private readonly _mouseDown = new EventEmitterOfT<IMouseEventArgs>();
    private readonly _mouseMove = new EventEmitterOfT<IMouseEventArgs>();
    private readonly _mouseUp = new EventEmitterOfT<IMouseEventArgs>();
    private _mouseListenersAttached = false;
    /**
     * The document receiving the move and release events of the active left button press, if any.
     */
    private _pressDocument: Document | null = null;
    /**
     * The last event handled by the document listeners. The same event reaches the element listeners afterwards
     * and must not be reported twice.
     */
    private _pressHandledEvent: MouseEvent | null = null;

    private _createMouseEmitter(emitter: EventEmitterOfT<IMouseEventArgs>): IEventEmitterOfT<IMouseEventArgs> {
        return {
            on: (value: (e: IMouseEventArgs) => void) => {
                this._attachMouseListeners();
                return emitter.on(value);
            },
            off: (value: (e: IMouseEventArgs) => void) => {
                emitter.off(value);
            }
        };
    }

    private _attachMouseListeners() {
        if (this._mouseListenersAttached) {
            return;
        }
        this._mouseListenersAttached = true;
        this.element.addEventListener('mousedown', this._onElementMouseDown, true);
        this.element.addEventListener('mousemove', this._onElementMouseMove, true);
        this.element.addEventListener('mouseup', this._onElementMouseUp, true);
    }

    private _onElementMouseDown = (e: MouseEvent) => {
        if (e.button === 0) {
            this._beginPress();
        }
        this._mouseDown.trigger(new BrowserMouseEventArgs(e));
    };

    private _onElementMouseMove = (e: MouseEvent) => {
        if (!this._pressDocument && e !== this._pressHandledEvent) {
            this._mouseMove.trigger(new BrowserMouseEventArgs(e));
        }
    };

    private _onElementMouseUp = (e: MouseEvent) => {
        if (!this._pressDocument && e !== this._pressHandledEvent) {
            this._mouseUp.trigger(new BrowserMouseEventArgs(e));
        }
    };

    private _onPressMouseMove = (e: MouseEvent) => {
        this._pressHandledEvent = e;
        if ((e.buttons & 1) === 0) {
            // the release happened where this document could not observe it (e.g. outside the browser window)
            this._endPress();
            this._mouseUp.trigger(new BrowserMouseEventArgs(e));
            return;
        }
        this._mouseMove.trigger(new BrowserMouseEventArgs(e));
    };

    private _onPressMouseUp = (e: MouseEvent) => {
        this._pressHandledEvent = e;
        if (e.button === 0) {
            this._endPress();
        }
        this._mouseUp.trigger(new BrowserMouseEventArgs(e));
    };

    private _beginPress() {
        if (this._pressDocument) {
            return;
        }
        const doc = this.element.ownerDocument;
        this._pressDocument = doc;
        doc.addEventListener('mousemove', this._onPressMouseMove, true);
        doc.addEventListener('mouseup', this._onPressMouseUp, true);
    }

    private _endPress() {
        const doc = this._pressDocument;
        if (!doc) {
            return;
        }
        this._pressDocument = null;
        doc.removeEventListener('mousemove', this._onPressMouseMove, true);
        doc.removeEventListener('mouseup', this._onPressMouseUp, true);
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
     * This event occurs when a mouse/finger moves on top of the control,
     * or anywhere in the document while a left button press started on the control is active.
     */
    public mouseMove: IEventEmitterOfT<IMouseEventArgs>;

    /**
     * This event occurs when a mouse/finger is released from the control.
     * A left button press started on the control always ends with a mouseUp, wherever the release happens.
     */
    public mouseUp: IEventEmitterOfT<IMouseEventArgs>;

    public appendChild(child: IContainer): void {
        this.element.appendChild((child as HtmlElementContainer).element);
    }

    public clear(): void {
        this.element.innerText = '';
    }
}
