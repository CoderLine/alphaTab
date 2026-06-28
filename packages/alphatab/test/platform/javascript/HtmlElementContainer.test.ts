import type { IContainer } from '@coderline/alphatab/platform/IContainer';
import type { IMouseEventArgs } from '@coderline/alphatab/platform/IMouseEventArgs';
import { HtmlElementContainer } from '@coderline/alphatab/platform/javascript/HtmlElementContainer';
import { afterEach, describe, expect, it, vi } from 'vitest';

type TestEventListener = EventListenerOrEventListenerObject;

interface TestListenerRegistration {
    listener: TestEventListener;
    options?: boolean | AddEventListenerOptions;
}

interface TestPointerEventOptions {
    pointerType?: string;
    pointerId?: number;
    isPrimary?: boolean;
    button?: number;
    pageX?: number;
    pageY?: number;
}

interface TestMouseEventOptions {
    button?: number;
    pageX?: number;
    pageY?: number;
}

interface MutableTestEvent {
    type: string;
    defaultPrevented: boolean;
    preventDefault(): void;
}

class TestHtmlElement {
    public readonly style: Partial<CSSStyleDeclaration> = {};
    public readonly ownerDocument = {
        defaultView: {
            pageXOffset: 5,
            pageYOffset: 7,
            PointerEvent: class PointerEvent {}
        }
    };
    public offsetWidth = 100;
    public offsetHeight = 100;
    public scrollLeft = 0;
    public scrollTop = 0;
    public scrollWidth = 100;
    public scrollHeight = 100;
    public clientWidth = 100;
    public clientHeight = 100;
    public readonly setPointerCapture = vi.fn();
    public readonly releasePointerCapture = vi.fn();
    private readonly _listeners = new Map<string, TestListenerRegistration[]>();
    private _bounds = { left: 10, top: 20, width: 100, height: 100 };

    public setBounds(left: number, top: number, width: number, height: number): void {
        this._bounds = { left, top, width, height };
        this.clientWidth = width;
        this.clientHeight = height;
    }

    public getBoundingClientRect(): DOMRect {
        const { left, top, width, height } = this._bounds;
        return {
            left,
            top,
            width,
            height,
            x: left,
            y: top,
            right: left + width,
            bottom: top + height,
            toJSON() {
                return this;
            }
        } as DOMRect;
    }

    public getClientRects(): DOMRect[] {
        return [this.getBoundingClientRect()];
    }

    public appendChild(_child: HTMLElement): void {}

    public addEventListener(
        type: string,
        listener: TestEventListener,
        options?: boolean | AddEventListenerOptions
    ): void {
        const listeners = this._listeners.get(type) ?? [];
        listeners.push({ listener, options });
        this._listeners.set(type, listeners);
    }

    public removeEventListener(
        type: string,
        listener: TestEventListener,
        options?: boolean | EventListenerOptions
    ): void {
        const listeners = this._listeners.get(type) ?? [];
        const capture = typeof options === 'boolean' ? options : options?.capture;
        this._listeners.set(
            type,
            listeners.filter(registration => {
                const registrationCapture =
                    typeof registration.options === 'boolean'
                        ? registration.options
                        : registration.options?.capture;
                return registration.listener !== listener || registrationCapture !== capture;
            })
        );
    }

    public dispatch(type: string, event: MutableTestEvent): void {
        event.type = type;
        const listeners = [...(this._listeners.get(type) ?? [])];
        for (const registration of listeners) {
            if (typeof registration.listener === 'function') {
                registration.listener.call(this, event as Event);
            } else {
                registration.listener.handleEvent(event as Event);
            }
        }
    }

    public listenerCount(type: string): number {
        return this._listeners.get(type)?.length ?? 0;
    }

    public listenerOptions(type: string): (boolean | AddEventListenerOptions | undefined)[] {
        return (this._listeners.get(type) ?? []).map(registration => registration.options);
    }
}

function createContainer(
    edgeScrollContainer: IContainer | null = null,
    canStartTouchSelection: () => boolean = () => true
): {
    element: TestHtmlElement;
    container: HtmlElementContainer;
} {
    const element = new TestHtmlElement();
    const container = new HtmlElementContainer(
        element as unknown as HTMLElement,
        edgeScrollContainer ? () => edgeScrollContainer : null,
        canStartTouchSelection
    );
    return { element, container };
}

function createPointerEvent(options: TestPointerEventOptions = {}): PointerEvent & MutableTestEvent {
    const event = {
        type: '',
        pointerType: options.pointerType ?? 'mouse',
        pointerId: options.pointerId ?? 1,
        isPrimary: options.isPrimary ?? true,
        button: options.button ?? 0,
        pageX: options.pageX ?? 0,
        pageY: options.pageY ?? 0,
        defaultPrevented: false,
        preventDefault() {
            event.defaultPrevented = true;
        }
    };
    return event as PointerEvent & MutableTestEvent;
}

function createMouseEvent(options: TestMouseEventOptions = {}): MouseEvent & MutableTestEvent {
    const event = {
        type: '',
        button: options.button ?? 0,
        pageX: options.pageX ?? 0,
        pageY: options.pageY ?? 0,
        defaultPrevented: false,
        preventDefault() {
            event.defaultPrevented = true;
        }
    };
    return event as MouseEvent & MutableTestEvent;
}

function createTouchEvent(): TouchEvent & MutableTestEvent {
    const event = {
        type: '',
        defaultPrevented: false,
        preventDefault() {
            event.defaultPrevented = true;
        }
    };
    return event as TouchEvent & MutableTestEvent;
}

describe('HtmlElementContainer', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('emits desktop mouse events from native mouse listeners and preserves button state', () => {
        const { element, container } = createContainer();
        const calls: string[] = [];
        const downArgs: IMouseEventArgs[] = [];
        container.mouseDown.on(e => {
            calls.push('down');
            downArgs.push(e);
        });
        container.mouseMove.on(() => calls.push('move'));
        container.mouseUp.on(() => calls.push('up'));

        element.dispatch('mousedown', createMouseEvent({ button: 0 }));
        element.dispatch('mousemove', createMouseEvent({ button: 0 }));
        element.dispatch('mouseup', createMouseEvent({ button: 0 }));
        element.dispatch('mousedown', createMouseEvent({ button: 2 }));

        expect(calls).toEqual(['down', 'move', 'up', 'down']);
        expect(downArgs[0].isLeftMouseButton).toBe(true);
        expect(downArgs[1].isLeftMouseButton).toBe(false);
        expect(element.listenerCount('pointerdown')).toBe(1);
        expect(element.listenerCount('mousedown')).toBe(1);
    });

    it('ignores mouse pointer events so desktop mouse is not emitted twice', () => {
        const { element, container } = createContainer();
        const calls: string[] = [];
        container.mouseDown.on(() => calls.push('down'));
        container.mouseMove.on(() => calls.push('move'));
        container.mouseUp.on(() => calls.push('up'));

        element.dispatch('pointerdown', createPointerEvent({ pointerType: 'mouse' }));
        element.dispatch('pointermove', createPointerEvent({ pointerType: 'mouse' }));
        element.dispatch('pointerup', createPointerEvent({ pointerType: 'mouse' }));

        expect(calls).toEqual([]);
    });

    it('forwards mouse preventDefault to the native MouseEvent', () => {
        const { element, container } = createContainer();
        container.mouseDown.on(e => e.preventDefault());

        const mouseDown = createMouseEvent();
        element.dispatch('mousedown', mouseDown);

        expect(mouseDown.defaultPrevented).toBe(true);
    });

    it('emits touch tap down and up without preventing native tap events', () => {
        vi.useFakeTimers();
        const { element, container } = createContainer();
        const downArgs: IMouseEventArgs[] = [];
        const upArgs: IMouseEventArgs[] = [];
        container.mouseDown.on(e => {
            downArgs.push(e);
            e.preventDefault();
        });
        container.mouseUp.on(e => {
            upArgs.push(e);
            e.preventDefault();
        });

        const pointerDown = createPointerEvent({ pointerType: 'touch', pageX: 45, pageY: 68 });
        const pointerUp = createPointerEvent({ pointerType: 'touch', pageX: 46, pageY: 69 });
        element.dispatch('pointerdown', pointerDown);
        element.dispatch('pointerup', pointerUp);
        vi.advanceTimersByTime(100);

        expect(downArgs).toHaveLength(1);
        expect(upArgs).toHaveLength(1);
        expect(downArgs[0].getX(container)).toBe(30);
        expect(downArgs[0].getY(container)).toBe(41);
        expect(pointerDown.defaultPrevented).toBe(false);
        expect(pointerUp.defaultPrevented).toBe(false);
    });

    it('suppresses touch compatibility mouse alphaTab events without blocking native listeners', () => {
        vi.useFakeTimers();
        const { element, container } = createContainer();
        const calls: string[] = [];
        const nativeMouseDown = vi.fn();
        container.mouseDown.on(e => {
            calls.push('down');
            e.preventDefault();
        });
        container.mouseUp.on(() => calls.push('up'));
        element.addEventListener('mousedown', nativeMouseDown);

        element.dispatch('pointerdown', createPointerEvent({ pointerType: 'touch' }));
        element.dispatch('pointerup', createPointerEvent({ pointerType: 'touch' }));
        const compatibilityMouseDown = createMouseEvent();
        element.dispatch('mousedown', compatibilityMouseDown);
        element.dispatch('mouseup', createMouseEvent());

        expect(calls).toEqual(['down', 'up']);
        expect(nativeMouseDown).toHaveBeenCalledTimes(1);
        expect(compatibilityMouseDown.defaultPrevented).toBe(false);
    });

    it('keeps long press alive through small touch jitter before activation', () => {
        vi.useFakeTimers();
        const { element, container } = createContainer();
        const calls: string[] = [];
        container.mouseDown.on(() => calls.push('down'));
        container.mouseUp.on(() => calls.push('up'));

        element.dispatch('pointerdown', createPointerEvent({ pointerType: 'touch', pageX: 50, pageY: 50 }));
        vi.advanceTimersByTime(50);
        element.dispatch('pointermove', createPointerEvent({ pointerType: 'touch', pageX: 54, pageY: 53 }));
        vi.advanceTimersByTime(50);
        element.dispatch('pointerup', createPointerEvent({ pointerType: 'touch', pageX: 54, pageY: 53 }));

        expect(calls).toEqual(['down', 'up']);
    });

    it('cancels touch long press when the finger moves before activation', () => {
        vi.useFakeTimers();
        const { element, container } = createContainer();
        const calls: string[] = [];
        container.mouseDown.on(() => calls.push('down'));
        container.mouseMove.on(() => calls.push('move'));
        container.mouseUp.on(() => calls.push('up'));

        element.dispatch('pointerdown', createPointerEvent({ pointerType: 'touch', pageX: 50, pageY: 50 }));
        vi.advanceTimersByTime(50);
        element.dispatch('pointermove', createPointerEvent({ pointerType: 'touch', pageX: 50, pageY: 70 }));
        vi.advanceTimersByTime(100);
        element.dispatch('pointerup', createPointerEvent({ pointerType: 'touch', pageX: 50, pageY: 70 }));

        expect(calls).toEqual([]);
    });

    it('emits long-press touch selection, prevents native touchmove, and edge-scrolls while active', () => {
        vi.useFakeTimers();
        const scrollElement = new TestHtmlElement();
        scrollElement.setBounds(0, 0, 100, 100);
        scrollElement.scrollTop = 50;
        scrollElement.scrollHeight = 200;
        const scrollContainer = new HtmlElementContainer(scrollElement as unknown as HTMLElement);
        const { element, container } = createContainer(scrollContainer);
        const calls: string[] = [];
        container.mouseDown.on(() => calls.push('down'));
        container.mouseMove.on(() => calls.push('move'));
        container.mouseUp.on(() => calls.push('up'));

        element.dispatch('pointerdown', createPointerEvent({ pointerType: 'touch', pageX: 50, pageY: 50 }));
        vi.advanceTimersByTime(100);

        const touchMove = createTouchEvent();
        element.dispatch('touchmove', touchMove);
        const pointerMove = createPointerEvent({ pointerType: 'touch', pageX: 50, pageY: 102 });
        element.dispatch('pointermove', pointerMove);
        element.dispatch('pointerup', createPointerEvent({ pointerType: 'touch', pageX: 50, pageY: 102 }));

        expect(calls).toEqual(['down', 'move', 'up']);
        expect(touchMove.defaultPrevented).toBe(true);
        expect(pointerMove.defaultPrevented).toBe(true);
        expect(element.setPointerCapture).toHaveBeenCalledWith(1);
        expect(element.releasePointerCapture).toHaveBeenCalledWith(1);
        expect(element.listenerOptions('touchmove')).toEqual([]);
        expect(scrollContainer.scrollTop).toBe(82);
    });

    it('does not capture or prevent touch selection when interaction is disabled', () => {
        vi.useFakeTimers();
        const scrollElement = new TestHtmlElement();
        scrollElement.setBounds(0, 0, 100, 100);
        scrollElement.scrollTop = 50;
        scrollElement.scrollHeight = 200;
        const scrollContainer = new HtmlElementContainer(scrollElement as unknown as HTMLElement);
        const { element, container } = createContainer(scrollContainer, () => false);
        const calls: string[] = [];
        container.mouseDown.on(() => calls.push('down'));
        container.mouseMove.on(() => calls.push('move'));
        container.mouseUp.on(() => calls.push('up'));

        element.dispatch('pointerdown', createPointerEvent({ pointerType: 'touch', pageX: 50, pageY: 50 }));
        vi.advanceTimersByTime(100);
        const touchMove = createTouchEvent();
        element.dispatch('touchmove', touchMove);
        const pointerMove = createPointerEvent({ pointerType: 'touch', pageX: 50, pageY: 102 });
        element.dispatch('pointermove', pointerMove);
        element.dispatch('pointerup', createPointerEvent({ pointerType: 'touch', pageX: 50, pageY: 102 }));

        expect(calls).toEqual([]);
        expect(touchMove.defaultPrevented).toBe(false);
        expect(pointerMove.defaultPrevented).toBe(false);
        expect(element.setPointerCapture).not.toHaveBeenCalled();
        expect(scrollContainer.scrollTop).toBe(50);
    });

    it('still emits touch tap events when interaction is disabled', () => {
        vi.useFakeTimers();
        const { element, container } = createContainer(null, () => false);
        const calls: string[] = [];
        container.mouseDown.on(() => calls.push('down'));
        container.mouseUp.on(() => calls.push('up'));

        element.dispatch('pointerdown', createPointerEvent({ pointerType: 'touch', pageX: 50, pageY: 50 }));
        vi.advanceTimersByTime(100);
        element.dispatch('pointerup', createPointerEvent({ pointerType: 'touch', pageX: 50, pageY: 50 }));

        expect(calls).toEqual(['down', 'up']);
        expect(element.setPointerCapture).not.toHaveBeenCalled();
    });

    it('resets active touch selection on pointercancel and emits a final up only when active', () => {
        vi.useFakeTimers();
        const { element, container } = createContainer();
        const calls: string[] = [];
        container.mouseDown.on(() => calls.push('down'));
        container.mouseUp.on(() => calls.push('up'));

        element.dispatch('pointerdown', createPointerEvent({ pointerType: 'touch', pointerId: 1 }));
        element.dispatch('pointercancel', createPointerEvent({ pointerType: 'touch', pointerId: 1 }));
        element.dispatch('pointerdown', createPointerEvent({ pointerType: 'touch', pointerId: 2 }));
        vi.advanceTimersByTime(100);
        element.dispatch('pointercancel', createPointerEvent({ pointerType: 'touch', pointerId: 2 }));

        expect(calls).toEqual(['down', 'up']);
        expect(element.releasePointerCapture).toHaveBeenCalledWith(2);
    });

    it('ignores secondary touch pointers while a primary touch is pending', () => {
        vi.useFakeTimers();
        const { element, container } = createContainer();
        const calls: string[] = [];
        container.mouseDown.on(() => calls.push('down'));
        container.mouseMove.on(() => calls.push('move'));
        container.mouseUp.on(() => calls.push('up'));

        element.dispatch('pointerdown', createPointerEvent({ pointerType: 'touch', pointerId: 1 }));
        element.dispatch('pointerdown', createPointerEvent({ pointerType: 'touch', pointerId: 2 }));
        element.dispatch('pointermove', createPointerEvent({ pointerType: 'touch', pointerId: 2 }));
        vi.advanceTimersByTime(100);
        element.dispatch('pointerup', createPointerEvent({ pointerType: 'touch', pointerId: 2 }));
        element.dispatch('pointerup', createPointerEvent({ pointerType: 'touch', pointerId: 1 }));

        expect(calls).toEqual(['down', 'up']);
    });

    it('removes native listeners and clears pending touch timers after unsubscribe', () => {
        vi.useFakeTimers();
        const { element, container } = createContainer();
        const down = vi.fn();
        const up = vi.fn();
        const unregisterDown = container.mouseDown.on(down);
        const unregisterUp = container.mouseUp.on(up);

        element.dispatch('pointerdown', createPointerEvent({ pointerType: 'touch' }));
        unregisterDown();
        unregisterUp();
        vi.advanceTimersByTime(100);

        expect(down).not.toHaveBeenCalled();
        expect(up).not.toHaveBeenCalled();
        expect(element.listenerCount('pointerdown')).toBe(0);
        expect(element.listenerCount('pointermove')).toBe(0);
        expect(element.listenerCount('pointerup')).toBe(0);
        expect(element.listenerCount('pointercancel')).toBe(0);
        expect(element.listenerCount('mousedown')).toBe(0);
        expect(element.listenerCount('mousemove')).toBe(0);
        expect(element.listenerCount('mouseup')).toBe(0);
        expect(element.listenerCount('touchmove')).toBe(0);
    });

    it('releases pointer capture when unsubscribing during active touch selection', () => {
        vi.useFakeTimers();
        const { element, container } = createContainer();
        const unregisterDown = container.mouseDown.on(vi.fn());
        const unregisterMove = container.mouseMove.on(vi.fn());
        const unregisterUp = container.mouseUp.on(vi.fn());

        element.dispatch('pointerdown', createPointerEvent({ pointerType: 'touch', pointerId: 3 }));
        vi.advanceTimersByTime(100);
        unregisterDown();
        unregisterMove();
        unregisterUp();

        expect(element.releasePointerCapture).toHaveBeenCalledWith(3);
        expect(element.listenerCount('touchmove')).toBe(0);
    });

    it('continues emitting to remaining listeners when a listener unsubscribes during dispatch', () => {
        const { element, container } = createContainer();
        const calls: string[] = [];
        let unregisterFirst = () => {};
        unregisterFirst = container.mouseDown.on(() => {
            calls.push('first');
            unregisterFirst();
        });
        container.mouseDown.on(() => calls.push('second'));

        element.dispatch('mousedown', createMouseEvent());

        expect(calls).toEqual(['first', 'second']);
    });

    it('treats pen as mouse-like compatibility input instead of touch long-press input', () => {
        vi.useFakeTimers();
        const { element, container } = createContainer();
        const calls: string[] = [];
        container.mouseDown.on(() => calls.push('down'));
        container.mouseMove.on(() => calls.push('move'));
        container.mouseUp.on(() => calls.push('up'));

        element.dispatch('pointerdown', createPointerEvent({ pointerType: 'pen' }));
        vi.advanceTimersByTime(100);
        element.dispatch('pointermove', createPointerEvent({ pointerType: 'pen' }));
        element.dispatch('pointerup', createPointerEvent({ pointerType: 'pen' }));
        element.dispatch('mousedown', createMouseEvent());
        element.dispatch('mousemove', createMouseEvent());
        element.dispatch('mouseup', createMouseEvent());

        expect(calls).toEqual(['down', 'move', 'up']);
        expect(element.setPointerCapture).not.toHaveBeenCalled();
    });
});
