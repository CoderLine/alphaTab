import type * as alphaTab from '@coderline/alphatab';

interface HandleDragState {
    isDragging: 'start' | 'end' | undefined;
}

function createSelectionHandles(element: HTMLElement): { startHandle: HTMLElement; endHandle: HTMLElement } {
    const handleWrapper = document.createElement('div');
    handleWrapper.classList.add('at-selection-handles');
    element.insertBefore(handleWrapper, element.querySelector('at-surface'));

    const startHandle = document.createElement('div');
    startHandle.classList.add('at-selection-handle', 'at-selection-handle-start');
    handleWrapper.appendChild(startHandle);

    const endHandle = document.createElement('div');
    endHandle.classList.add('at-selection-handle', 'at-selection-handle-end');
    handleWrapper.appendChild(endHandle);

    return { startHandle, endHandle };
}

function setupHandleDrag(
    element: HTMLElement,
    handle: HTMLElement,
    dragState: HandleDragState,
    type: HandleDragState['isDragging'],
    onMove: (e: MouseEvent) => void,
    onDragEnd: (e: MouseEvent) => void
) {
    handle.addEventListener(
        'mousedown',
        e => {
            e.preventDefault();
            element.classList.add('at-selection-handle-drag');
            handle.classList.add('at-selection-handle-drag');
            dragState.isDragging = type;
        },
        false
    );
    document.addEventListener(
        'mousemove',
        e => {
            if (dragState.isDragging !== type) {
                return;
            }
            e.preventDefault();
            onMove(e);
        },
        true
    );
    document.addEventListener(
        'mouseup',
        e => {
            if (dragState.isDragging !== type) {
                return;
            }
            e.preventDefault();
            dragState.isDragging = undefined;
            element.classList.remove('at-selection-handle-drag');
            handle.classList.remove('at-selection-handle-drag');
            onDragEnd(e);
        },
        true
    );
}

function getRelativePosition(parent: HTMLElement, e: MouseEvent): { relX: number; relY: number } {
    const parentPos = parent.getBoundingClientRect();
    const parentLeft: number = parentPos.left + parent.ownerDocument!.defaultView!.pageXOffset;
    const parentTop: number = parentPos.top + parent.ownerDocument!.defaultView!.pageYOffset;

    const relX = e.pageX - parentLeft;
    const relY = e.pageY - parentTop;

    return { relX, relY };
}

function getBeatFromEvent(
    element: HTMLElement,
    api: alphaTab.AlphaTabApi,
    e: MouseEvent
): alphaTab.model.Beat | undefined {
    const { relX, relY } = getRelativePosition(element, e);
    const beat = api.boundsLookup?.getBeatAtPos(relX, relY);
    if (!beat) {
        return undefined;
    }

    const bounds = api.boundsLookup!.findBeat(beat);
    if (!bounds) {
        return undefined;
    }

    // only snap to beat beat if we are over the whitespace after the beat
    const visualBoundsEnd = bounds.visualBounds.x + bounds.visualBounds.w;
    const realBoundsEnd = bounds.realBounds.x + bounds.realBounds.w;
    if (relX < visualBoundsEnd || relX > realBoundsEnd) {
        return undefined;
    }

    return beat;
}

export function setupSelectionHandles(element: HTMLElement, api: alphaTab.AlphaTabApi) {
    const { startHandle, endHandle } = createSelectionHandles(element);

    // listen to selection range changes to place handles
    let currentHighlight: alphaTab.PlaybackHighlightChangeEventArgs | undefined;
    api.playbackRangeHighlightChanged.on(e => {
        currentHighlight = e;
        // no selection
        if (!e.startBeat || !e.endBeat) {
            startHandle.classList.remove('active');
            endHandle.classList.remove('active');
            return;
        }

        startHandle.classList.add('active');
        startHandle.style.left = `${e.startBeatBounds!.realBounds.x}px`;
        startHandle.style.top = `${e.startBeatBounds!.barBounds.masterBarBounds.visualBounds.y}px`;
        startHandle.style.height = `${e.startBeatBounds!.barBounds.masterBarBounds.visualBounds.h}px`;

        endHandle.classList.add('active');
        endHandle.style.left = `${e.endBeatBounds!.realBounds.x + e.endBeatBounds!.realBounds.w}px`;
        endHandle.style.top = `${e.endBeatBounds!.barBounds.masterBarBounds.visualBounds.y}px`;
        endHandle.style.height = `${e.endBeatBounds!.barBounds.masterBarBounds.visualBounds.h}px`;
    });

    // setup dragging of handles
    const dragState: HandleDragState = { isDragging: undefined };

    setupHandleDrag(
        element,
        startHandle,
        dragState,
        'start',
        e => {
            if (!currentHighlight?.startBeat) {
                return;
            }

            const beat = getBeatFromEvent(element, api, e);
            if (!beat) {
                return;
            }

            api.highlightPlaybackRange(beat, currentHighlight.endBeat!);
        },
        () => {
            api.applyPlaybackRangeFromHighlight();
        }
    );

    setupHandleDrag(
        element,
        endHandle,
        dragState,
        'end',
        e => {
            if (!currentHighlight?.startBeat) {
                return;
            }

            const beat = getBeatFromEvent(element, api, e);
            if (!beat) {
                return;
            }

            api.highlightPlaybackRange(currentHighlight!.startBeat!, beat);
        },
        () => {
            api.applyPlaybackRangeFromHighlight();
        }
    );
}
