import type { IEventEmitter, IEventEmitterOfT } from '@coderline/alphatab/EventEmitter';
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

type MouseEventListener = (arg: IMouseEventArgs) => void;

/**
 * @target web
 * @internal
 */
export class HtmlElementContainer implements IHtmlElementContainer {
    private static readonly _touchLongPressDelay = 60;
    private static readonly _touchMoveSlop = 80;
    private static readonly _edgeScrollThreshold = 50;
    private static readonly _edgeScrollMaxStep = 32;
    private static readonly _compatibilityMouseSuppressionDelay = 800;

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
    private _mouseDownListeners: MouseEventListener[] = [];
    private _mouseMoveListeners: MouseEventListener[] = [];
    private _mouseUpListeners: MouseEventListener[] = [];
    private _nativeMouseListenersActive = false;
    private _activeTouchPointerId: number | null = null;
    private _pendingTouchDown: PointerEvent | null = null;
    private _touchLongPressTimer: ReturnType<typeof setTimeout> | null = null;
    private _touchSelectionActive = false;
    private _touchGestureCancelled = false;
    private _touchPointerCaptured = false;
    private _suppressCompatibilityMouseEvents = false;
    private _compatibilityMouseSuppressionTimer: ReturnType<typeof setTimeout> | null = null;
    private _touchStartPageX = 0;
    private _touchStartPageY = 0;
    private readonly _touchMoveOptions: AddEventListenerOptions = {
        capture: true,
        passive: false
    };

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

    public constructor(
        element: HTMLElement,
        private readonly _edgeScrollContainer: (() => IContainer) | null = null,
        private readonly _canStartTouchSelection: () => boolean = () => true
    ) {
        this.element = element;

        this.mouseDown = {
            on: (value: any) => {
                this._addMouseEventListener(this._mouseDownListeners, value);
                return () => this._removeMouseEventListener(this._mouseDownListeners, value);
            },
            off: (value: any) => this._removeMouseEventListener(this._mouseDownListeners, value)
        };

        this.mouseUp = {
            on: (value: any) => {
                this._addMouseEventListener(this._mouseUpListeners, value);
                return () => this._removeMouseEventListener(this._mouseUpListeners, value);
            },
            off: (value: any) => this._removeMouseEventListener(this._mouseUpListeners, value)
        };

        this.mouseMove = {
            on: (value: any) => {
                this._addMouseEventListener(this._mouseMoveListeners, value);
                return () => this._removeMouseEventListener(this._mouseMoveListeners, value);
            },
            off: (value: any) => this._removeMouseEventListener(this._mouseMoveListeners, value)
        };

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

    private _addMouseEventListener(listeners: MouseEventListener[], value: MouseEventListener): void {
        listeners.push(value);
        this._ensureNativeMouseListeners();
    }

    private _removeMouseEventListener(listeners: MouseEventListener[], value: MouseEventListener): void {
        const index = listeners.indexOf(value);
        if (index >= 0) {
            listeners.splice(index, 1);
        }
        this._releaseNativeMouseListenersIfUnused();
    }

    private _ensureNativeMouseListeners(): void {
        if (this._nativeMouseListenersActive) {
            return;
        }

        this.element.addEventListener('mousedown', this._onMouseDown, true);
        this.element.addEventListener('mousemove', this._onMouseMove, true);
        this.element.addEventListener('mouseup', this._onMouseUp, true);
        if (this._supportsPointerEvents) {
            this.element.addEventListener('pointerdown', this._onPointerDown, true);
            this.element.addEventListener('pointermove', this._onPointerMove, true);
            this.element.addEventListener('pointerup', this._onPointerUp, true);
            this.element.addEventListener('pointercancel', this._onPointerCancel, true);
        }
        this._nativeMouseListenersActive = true;
    }

    private _releaseNativeMouseListenersIfUnused(): void {
        if (
            !this._nativeMouseListenersActive ||
            this._mouseDownListeners.length + this._mouseMoveListeners.length + this._mouseUpListeners.length > 0
        ) {
            return;
        }

        this._resetTouchGesture(true);
        this._clearCompatibilityMouseSuppression();
        this.element.removeEventListener('mousedown', this._onMouseDown, true);
        this.element.removeEventListener('mousemove', this._onMouseMove, true);
        this.element.removeEventListener('mouseup', this._onMouseUp, true);
        if (this._supportsPointerEvents) {
            this.element.removeEventListener('pointerdown', this._onPointerDown, true);
            this.element.removeEventListener('pointermove', this._onPointerMove, true);
            this.element.removeEventListener('pointerup', this._onPointerUp, true);
            this.element.removeEventListener('pointercancel', this._onPointerCancel, true);
        }
        this._nativeMouseListenersActive = false;
    }

    private get _supportsPointerEvents(): boolean {
        const ownerWindow = this.element.ownerDocument?.defaultView;
        return !!ownerWindow && 'PointerEvent' in ownerWindow;
    }

    private readonly _onMouseDown = (e: MouseEvent): void => {
        if (this._suppressCompatibilityMouseEvents) {
            return;
        }
        this._emitMouseEvent(this._mouseDownListeners, e);
    };

    private readonly _onMouseMove = (e: MouseEvent): void => {
        if (this._suppressCompatibilityMouseEvents) {
            return;
        }
        this._emitMouseEvent(this._mouseMoveListeners, e);
    };

    private readonly _onMouseUp = (e: MouseEvent): void => {
        if (this._suppressCompatibilityMouseEvents) {
            return;
        }
        this._emitMouseEvent(this._mouseUpListeners, e);
    };

    private readonly _onPointerDown = (e: PointerEvent): void => {
        if (e.pointerType !== 'touch') {
            return;
        }

        if (!e.isPrimary || this._activeTouchPointerId !== null) {
            return;
        }

        this._activeTouchPointerId = e.pointerId;
        this._pendingTouchDown = e;
        this._touchGestureCancelled = false;
        this._touchSelectionActive = false;
        this._touchStartPageX = e.pageX;
        this._touchStartPageY = e.pageY;
        this._clearTouchLongPressTimer();
        if (this._canStartTouchSelection()) {
            this._touchLongPressTimer = setTimeout(() => {
                if (
                    this._activeTouchPointerId === e.pointerId &&
                    !this._touchGestureCancelled &&
                    this._canStartTouchSelection()
                ) {
                    this._activateTouchSelection(e);
                }
            }, HtmlElementContainer._touchLongPressDelay);
        }
    };

    private readonly _onPointerMove = (e: PointerEvent): void => {
        if (e.pointerType !== 'touch') {
            return;
        }

        if (e.pointerId !== this._activeTouchPointerId || !e.isPrimary) {
            return;
        }

        if (!this._touchSelectionActive) {
            if (this._isPastTouchMoveSlop(e)) {
                this._touchGestureCancelled = true;
                this._clearTouchLongPressTimer();
            }
            return;
        }

        if (this._canStartTouchSelection()) {
            e.preventDefault();
        }
        this._emitMouseEvent(this._mouseMoveListeners, e);
        if (this._canStartTouchSelection()) {
            this._autoScrollAtEdge(new BrowserMouseEventArgs(e));
        }
    };

    private readonly _onPointerUp = (e: PointerEvent): void => {
        if (e.pointerType !== 'touch') {
            return;
        }

        if (e.pointerId !== this._activeTouchPointerId || !e.isPrimary) {
            return;
        }

        if (this._touchSelectionActive) {
            if (this._canStartTouchSelection()) {
                e.preventDefault();
            }
            this._emitMouseEvent(this._mouseUpListeners, e);
            this._suppressCompatibilityMouseEventsAfterTouch();
        } else if (!this._touchGestureCancelled && this._pendingTouchDown) {
            this._emitMouseEvent(this._mouseDownListeners, this._pendingTouchDown, false);
            this._emitMouseEvent(this._mouseUpListeners, e, false);
            this._suppressCompatibilityMouseEventsAfterTouch();
        }

        this._resetTouchGesture(true);
    };

    private readonly _onPointerCancel = (e: PointerEvent): void => {
        if (e.pointerType !== 'touch' || e.pointerId !== this._activeTouchPointerId) {
            return;
        }

        if (this._touchSelectionActive) {
            this._emitMouseEvent(this._mouseUpListeners, e);
            this._suppressCompatibilityMouseEventsAfterTouch();
        }
        this._resetTouchGesture(true);
    };

    private readonly _onActiveTouchMove = (e: TouchEvent): void => {
        if (this._touchSelectionActive && this._canStartTouchSelection()) {
            e.preventDefault();
        }
    };

    private _activateTouchSelection(e: PointerEvent): void {
        if (!this._canStartTouchSelection()) {
            return;
        }
        this._touchSelectionActive = true;
        this._pendingTouchDown = null;
        if (this.element.setPointerCapture) {
            this.element.setPointerCapture(e.pointerId);
            this._touchPointerCaptured = true;
        }
        this.element.addEventListener('touchmove', this._onActiveTouchMove, this._touchMoveOptions);
        this._emitMouseEvent(this._mouseDownListeners, e);
    }

    private _resetTouchGesture(releasePointerCapture: boolean): void {
        const pointerId = this._activeTouchPointerId;
        this._clearTouchLongPressTimer();
        this.element.removeEventListener('touchmove', this._onActiveTouchMove, true);
        if (releasePointerCapture && this._touchPointerCaptured && pointerId !== null && this.element.releasePointerCapture) {
            this.element.releasePointerCapture(pointerId);
        }
        this._activeTouchPointerId = null;
        this._pendingTouchDown = null;
        this._touchSelectionActive = false;
        this._touchGestureCancelled = false;
        this._touchPointerCaptured = false;
    }

    private _isPastTouchMoveSlop(e: PointerEvent): boolean {
        const x = e.pageX - this._touchStartPageX;
        const y = e.pageY - this._touchStartPageY;
        return x * x + y * y > HtmlElementContainer._touchMoveSlop * HtmlElementContainer._touchMoveSlop;
    }

    private _clearTouchLongPressTimer(): void {
        if (this._touchLongPressTimer !== null) {
            clearTimeout(this._touchLongPressTimer);
            this._touchLongPressTimer = null;
        }
    }

    private _suppressCompatibilityMouseEventsAfterTouch(): void {
        this._clearCompatibilityMouseSuppression();
        this._suppressCompatibilityMouseEvents = true;
        this._compatibilityMouseSuppressionTimer = setTimeout(() => {
            this._suppressCompatibilityMouseEvents = false;
            this._compatibilityMouseSuppressionTimer = null;
        }, HtmlElementContainer._compatibilityMouseSuppressionDelay);
    }

    private _clearCompatibilityMouseSuppression(): void {
        if (this._compatibilityMouseSuppressionTimer !== null) {
            clearTimeout(this._compatibilityMouseSuppressionTimer);
            this._compatibilityMouseSuppressionTimer = null;
        }
        this._suppressCompatibilityMouseEvents = false;
    }

    private _emitMouseEvent(listeners: MouseEventListener[], e: MouseEvent, allowPreventDefault: boolean = true): void {
        const args = new BrowserMouseEventArgs(e, allowPreventDefault);
        for (const listener of [...listeners]) {
            listener(args);
        }
    }

    private _autoScrollAtEdge(e: IMouseEventArgs): void {
        if (!this._edgeScrollContainer) {
            return;
        }

        const scrollContainer = this._edgeScrollContainer();
        const scrollElement = (scrollContainer as HtmlElementContainer).element;
        const x = e.getX(scrollContainer);
        const y = e.getY(scrollContainer);
        const width = scrollElement.clientWidth || scrollContainer.width;
        const height = scrollElement.clientHeight || scrollContainer.height;
        const scrollLeftStep = HtmlElementContainer._getEdgeScrollStep(x, width);
        const scrollTopStep = HtmlElementContainer._getEdgeScrollStep(y, height);

        if (scrollLeftStep !== 0) {
            scrollContainer.scrollLeft = HtmlElementContainer._clamp(
                scrollContainer.scrollLeft + scrollLeftStep,
                0,
                Math.max(0, scrollElement.scrollWidth - width)
            );
        }

        if (scrollTopStep !== 0) {
            scrollContainer.scrollTop = HtmlElementContainer._clamp(
                scrollContainer.scrollTop + scrollTopStep,
                0,
                Math.max(0, scrollElement.scrollHeight - height)
            );
        }
    }

    private static _getEdgeScrollStep(distanceFromStart: number, viewportSize: number): number {
        const threshold = HtmlElementContainer._edgeScrollThreshold;
        const distanceFromEnd = viewportSize - distanceFromStart;
        if (distanceFromStart < threshold) {
            return -Math.min(HtmlElementContainer._edgeScrollMaxStep, threshold - distanceFromStart);
        }
        if (distanceFromEnd < threshold) {
            return Math.min(HtmlElementContainer._edgeScrollMaxStep, threshold - distanceFromEnd);
        }
        return 0;
    }

    private static _clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
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
        this.element.innerText = '';
    }
}
