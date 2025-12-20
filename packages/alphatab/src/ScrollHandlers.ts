import type { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import type { MidiTickLookupFindBeatResultCursorMode } from '@coderline/alphatab/midi/MidiTickLookup';
import { MidiUtils } from '@coderline/alphatab/midi/MidiUtils';
import { ScrollMode } from '@coderline/alphatab/PlayerSettings';
import type { BeatBounds, MasterBarBounds } from '@coderline/alphatab/rendering/_barrel';

/**
 * Classes implementing this interface can handle the scroll logic
 * as the playback in alphaTab progresses.
 *
 *
 * @public
 */
export interface IScrollHandler extends Disposable {
    /**
     * Requests a instant scrolling to the specified beat.
     * @param currentBeatBounds The bounds and information about the current beat.
     */
    forceScrollTo(currentBeatBounds: BeatBounds): void;

    /**
     * Updates whenever the currently beat cursor is updating its start and end location
     * from which it starts and animates to.
     * @remarks
     * This method is tightly coupled to how alphaTab internally handles the beat cursor display.
     * alphaTab looks up the current and next beat to which the beat cursor needs to transition
     * in a specific amount of time.
     *
     * In some occations the cursor will transition to the end of the bar instead of the next beat.
     *
     * @param startBeat the information about the beat where the cursor is starting its animation.
     * @param endBeat the information about the beat where the cursor is ending its animation.
     * @param cursorMode how the cursor is transitioning (e.g. to end of bar or to the location of the next beat)
     * @param actualBeatCursorStartX the exact start position of the beat cursor animation.
     * Depending on the exact time of the player, this position might be relatively adjusted.
     * @param actualBeatCursorEndX the exact end position of the beat cursor animation.
     * Depending on the exact time of the player and cursor mode,
     * this might be beyond the expected bounds.
     * To ensure a smooth cursor experience (no jumping/flicking back and forth), alphaTab
     * optimizes the used end position and animation durations.
     * @param actualBeatCursorTransitionDuration The duration of the beat cursor transition in milliseconds.
     * Similar to the start and end positions, this duration is adjusted accordingly to ensure
     * that the beat cursor remains smoothly at the expected position for the currently played time.
     *
     */
    onBeatCursorUpdating(
        startBeat: BeatBounds,
        endBeat: BeatBounds | undefined,
        cursorMode: MidiTickLookupFindBeatResultCursorMode,
        actualBeatCursorStartX: number,
        actualBeatCursorEndX: number,
        actualBeatCursorTransitionDuration: number
    ): void;
}

/**
 * Some basic scroll handler checking for changed offsets and scroll if changed.
 * @internal
 */
export abstract class BasicScrollHandler<TSettings> implements IScrollHandler {
    protected api: AlphaTabApiBase<TSettings>;
    protected lastScroll = -1;

    public constructor(api: AlphaTabApiBase<TSettings>) {
        this.api = api;
    }

    [Symbol.dispose]() {
        // do nothing
    }

    public forceScrollTo(currentBeatBounds: BeatBounds): void {
        this._scrollToBeat(currentBeatBounds, true);
        this.lastScroll = -1; // force new scroll on next update
    }

    private _scrollToBeat(currentBeatBounds: BeatBounds, force: boolean) {
        const newLastScroll = this.calculateLastScroll(currentBeatBounds);
        // no change, and no instant/force scroll
        if (newLastScroll === this.lastScroll && !force) {
            return;
        }
        this.lastScroll = newLastScroll;

        this.doScroll(currentBeatBounds);
    }

    protected abstract calculateLastScroll(currentBeatBounds: BeatBounds): number;
    protected abstract doScroll(currentBeatBounds: BeatBounds): void;

    public onBeatCursorUpdating(
        startBeat: BeatBounds,
        _endBeat: BeatBounds,
        _cursorMode: MidiTickLookupFindBeatResultCursorMode,
        _actualBeatCursorStartX: number,
        _actualBeatCursorEndX: number,
        _actualBeatCursorTransitionDuration: number
    ): void {
        this._scrollToBeat(startBeat, false);
    }
}

/**
 * This is the default scroll handler for vertical layouts using {@link ScrollMode.Continuous}.
 * Whenever the system changes, we scroll to the new system position vertically.
 * @internal
 */
export class VerticalContinuousScrollHandler<TSettings> extends BasicScrollHandler<TSettings> {
    protected override calculateLastScroll(currentBeatBounds: BeatBounds): number {
        return currentBeatBounds.barBounds.masterBarBounds.realBounds.y;
    }

    protected override doScroll(currentBeatBounds: BeatBounds): void {
        const ui = this.api.uiFacade;
        const settings = this.api.settings;

        const scroll = ui.getScrollContainer();
        const elementOffset = ui.getOffset(scroll, this.api.container);
        const y = currentBeatBounds.barBounds.masterBarBounds.realBounds.y + settings.player.scrollOffsetY;
        ui.scrollToY(scroll, elementOffset.y + y, this.api.settings.player.scrollSpeed);
    }
}

/**
 * This is the default scroll handler for vertical layouts using {@link ScrollMode.OffScreen}.
 * Whenever the system changes, we check if the new system bounds are out-of-screen and if yes, we scroll.
 * @internal
 */
export class VerticalOffScreenScrollHandler<TSettings> extends BasicScrollHandler<TSettings> {
    protected override calculateLastScroll(currentBeatBounds: BeatBounds): number {
        // check for system change
        return currentBeatBounds.barBounds.masterBarBounds.realBounds.y;
    }

    protected override doScroll(currentBeatBounds: BeatBounds): void {
        const ui = this.api.uiFacade;
        const settings = this.api.settings;

        const scroll = ui.getScrollContainer();
        const elementBottom: number = scroll.scrollTop + ui.getOffset(null, scroll).h;
        const barBoundings = currentBeatBounds.barBounds.masterBarBounds;
        if (
            barBoundings.visualBounds.y + barBoundings.visualBounds.h >= elementBottom ||
            barBoundings.visualBounds.y < scroll.scrollTop
        ) {
            const scrollTop: number = barBoundings.realBounds.y + settings.player.scrollOffsetY;
            ui.scrollToY(scroll, scrollTop, settings.player.scrollSpeed);
        }
    }
}

/**
 * This is the default scroll handler for vertical layouts using {@link ScrollMode.Smooth}.
 * vertical smooth scrolling aims to place the on-time position
 * at scrollOffsetY **at the time when a system starts**
 * this means when a system starts, it is at scrollOffsetY,
 * then gradually scrolls down the system height reaching the bottom
 * when the system completes.
 * @internal
 */
export class VerticalSmoothScrollHandler<TSettings> implements IScrollHandler {
    private _api: AlphaTabApiBase<TSettings>;
    private _lastScroll = -1;
    private _scrollContainerResizeUnregister: () => void;

    public constructor(api: AlphaTabApiBase<TSettings>) {
        this._api = api;
        // we need a resize listener for the overflow calculation
        this._scrollContainerResizeUnregister = api.uiFacade.getScrollContainer().resize.on(() => {
            const scrollContainer = api.uiFacade.getScrollContainer();

            const overflowNeeded = api.settings.player.scrollOffsetX;
            const viewPortSize = scrollContainer.width;

            // the content needs to shift out of screen (and back into screen with the offset)
            // that's why we need the whole width as additional overflow
            const overflowNeededAbsolute = viewPortSize + overflowNeeded;

            api.uiFacade.setCanvasOverflow(api.canvasElement, overflowNeededAbsolute, true);
        });
    }

    [Symbol.dispose]() {
        this._scrollContainerResizeUnregister();
    }

    public forceScrollTo(currentBeatBounds: BeatBounds): void {
        const ui = this._api.uiFacade;
        const settings = this._api.settings;

        const scroll = ui.getScrollContainer();
        const systemTop: number =
            currentBeatBounds.barBounds.masterBarBounds.realBounds.y + settings.player.scrollOffsetY;

        ui.scrollToY(scroll, systemTop, 0);
        this._lastScroll = -1;
    }

    public onBeatCursorUpdating(
        startBeat: BeatBounds,
        _endBeat: BeatBounds,
        _cursorMode: MidiTickLookupFindBeatResultCursorMode,
        _actualBeatCursorStartX: number,
        _actualBeatCursorEndX: number,
        actualBeatCursorTransitionDuration: number
    ): void {
        const ui = this._api.uiFacade;
        const settings = this._api.settings;

        const barBoundings = startBeat.barBounds.masterBarBounds;
        const systemTop: number = barBoundings.realBounds.y + settings.player.scrollOffsetY;
        if (systemTop === this._lastScroll && actualBeatCursorTransitionDuration > 0) {
            return;
        }

        // jump to start of new system
        const scroll = ui.getScrollContainer();
        ui.scrollToY(scroll, systemTop, 0);

        // instant scroll
        if (actualBeatCursorTransitionDuration === 0) {
            this._lastScroll = -1;
            return;
        }

        // dynamic scrolling
        this._lastScroll = systemTop;
        // scroll to bottom over time
        const systemBottom = systemTop + barBoundings.realBounds.h;

        // NOTE: this calculation is a bit more expensive, but we only do it once per system
        // so we should be good:
        // * the more bars we have, the longer the system will play, hence the duration can take a bit longer
        // * if we have less bars, we calculate more often, but the calculation will be faster because we sum up less bars.
        const systemDuration = this._calculateSystemDuration(barBoundings);
        ui.scrollToY(scroll, systemBottom, systemDuration);
    }

    private _calculateSystemDuration(barBoundings: MasterBarBounds) {
        const systemBars = barBoundings.staffSystemBounds!.bars;
        const tickCache = this._api.tickCache!;

        let duration = 0;

        const masterBars = this._api.score!.masterBars;
        for (const bar of systemBars) {
            const mb = masterBars[bar.index];

            const mbInfo = tickCache.getMasterBar(mb);
            const tempoChanges = tickCache.getMasterBar(mb).tempoChanges;

            let tempo = tempoChanges[0].tempo;
            let tick = tempoChanges[0].tick;
            for (let i = 1; i < tempoChanges.length; i++) {
                const diff = tempoChanges[i].tick - tick;
                duration += MidiUtils.ticksToMillis(diff, tempo);
                tempo = tempoChanges[i].tempo;
                tick = tempoChanges[i].tick;
            }

            const toEnd = mbInfo.end - tick;
            duration += MidiUtils.ticksToMillis(toEnd, tempo);
        }

        return duration;
    }
}

/**
 * This is the default scroll handler for horizontal layouts using {@link ScrollMode.Continuous}.
 * Whenever the master bar changes, we scroll to the position horizontally.
 * @internal
 */
export class HorizontalContinuousScrollHandler<TSettings> extends BasicScrollHandler<TSettings> {
    protected override calculateLastScroll(currentBeatBounds: BeatBounds): number {
        return currentBeatBounds.barBounds.masterBarBounds.visualBounds.x;
    }

    protected override doScroll(currentBeatBounds: BeatBounds): void {
        const ui = this.api.uiFacade;
        const settings = this.api.settings;
        const scroll = ui.getScrollContainer();

        const barBoundings = currentBeatBounds.barBounds.masterBarBounds;
        const scrollLeftContinuous: number = barBoundings.realBounds.x + settings.player.scrollOffsetX;
        ui.scrollToX(scroll, scrollLeftContinuous, settings.player.scrollSpeed);
    }
}

/**
 * This is the default scroll handler for horizontal layouts using {@link ScrollMode.OffScreen}.
 * Whenever the system changes, we check if the new system bounds are out-of-screen and if yes, we scroll.
 * @internal
 */
export class HorizontalOffScreenScrollHandler<TSettings> extends BasicScrollHandler<TSettings> {
    protected override calculateLastScroll(currentBeatBounds: BeatBounds): number {
        return currentBeatBounds.barBounds.masterBarBounds.visualBounds.x;
    }

    protected override doScroll(currentBeatBounds: BeatBounds): void {
        const ui = this.api.uiFacade;
        const settings = this.api.settings;
        const scroll = ui.getScrollContainer();

        const elementRight: number = scroll.scrollLeft + ui.getOffset(null, scroll).w;
        const barBoundings = currentBeatBounds.barBounds.masterBarBounds;
        if (
            barBoundings.visualBounds.x + barBoundings.visualBounds.w >= elementRight ||
            barBoundings.visualBounds.x < scroll.scrollLeft
        ) {
            const scrollLeftOffScreen: number = barBoundings.realBounds.x + settings.player.scrollOffsetX;
            ui.scrollToX(scroll, scrollLeftOffScreen, settings.player.scrollSpeed);
        }
    }
}

/**
 * This is the default scroll handler for horizontal layouts using {@link ScrollMode.Smooth}.
 * horiontal smooth scrolling aims to place the on-time position
 * at scrollOffsetX from a beat-to-beat perspective.
 * This achieves an steady cursor at the same position with rather the music sheet scrolling past it.
 * Due to some animation inconsistencies (e.g. CSS animation vs scrolling) there might be a slight
 * flickering of the cursor.
 *
 * To get a fully steady cursor the beat cursor can simply be visually hidden and a cursor can be placed at
 * `scrollOffsetX` by the integrator.
 * @internal
 */
export class HorizontalSmoothScrollHandler<TSettings> implements IScrollHandler {
    private _api: AlphaTabApiBase<TSettings>;
    private _lastScroll = -1;
    private _scrollContainerResizeUnregister: () => void;

    public constructor(api: AlphaTabApiBase<TSettings>) {
        this._api = api;
        // we need a resize listener for the overflow calculation
        this._scrollContainerResizeUnregister = api.uiFacade.getScrollContainer().resize.on(() => {
            const scrollContainer = api.uiFacade.getScrollContainer();

            const overflowNeeded = api.settings.player.scrollOffsetY;
            const viewPortSize = scrollContainer.height;

            // the content needs to shift out of screen (and back into screen with the offset)
            // that's why we need the whole width as additional overflow
            const overflowNeededAbsolute = viewPortSize + overflowNeeded;

            api.uiFacade.setCanvasOverflow(api.canvasElement, overflowNeededAbsolute, false);
        });
    }

    [Symbol.dispose]() {
        this._scrollContainerResizeUnregister();
    }

    public forceScrollTo(currentBeatBounds: BeatBounds): void {
        const ui = this._api.uiFacade;
        const settings = this._api.settings;

        const scroll = ui.getScrollContainer();
        const barStartX: number = currentBeatBounds.onNotesX + settings.player.scrollOffsetY;

        ui.scrollToY(scroll, barStartX, 0);
        this._lastScroll = -1;
    }

    public onBeatCursorUpdating(
        _startBeat: BeatBounds,
        _endBeat: BeatBounds,
        _cursorMode: MidiTickLookupFindBeatResultCursorMode,
        actualBeatCursorStartX: number,
        actualBeatCursorEndX: number,
        actualBeatCursorTransitionDuration: number
    ): void {
        const ui = this._api.uiFacade;

        if (actualBeatCursorEndX === this._lastScroll && actualBeatCursorTransitionDuration > 0) {
            return;
        }

        // jump to start of new system
        const settings = this._api.settings;
        const scroll = ui.getScrollContainer();
        ui.scrollToX(scroll, actualBeatCursorStartX + settings.player.scrollOffsetX, 0);

        // instant scroll
        if (actualBeatCursorTransitionDuration === 0) {
            this._lastScroll = -1;
            return;
        }

        this._lastScroll = actualBeatCursorEndX;
        const scrollX = actualBeatCursorEndX + settings.player.scrollOffsetX;
        ui.scrollToX(scroll, scrollX, actualBeatCursorTransitionDuration);
    }
}
