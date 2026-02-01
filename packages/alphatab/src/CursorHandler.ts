import { MidiTickLookupFindBeatResultCursorMode } from '@coderline/alphatab/midi/MidiTickLookup';
import type { Cursors } from '@coderline/alphatab/platform/Cursors';
import type { IContainer } from '@coderline/alphatab/platform/IContainer';
import type { BeatBounds } from '@coderline/alphatab/rendering/_barrel';

/**
 * Classes implementing this interface can handle the cursor placement logic
 * as the playback in alphaTab progresses.
 *
 * @public
 */
export interface ICursorHandler {
    /**
     * Called when this handler activates. This can be on dynamic cursor creation
     * or when setting a custom handler with cursors already created.
     * @param cursors  A container holding information about the cursor elements.
     */
    onAttach(cursors: Cursors): void;
    /**
     * Called when this handler deactivates. This can be on dynamic cursor destroy
     * or when setting a new custom handler.
     * @param cursors A container holding information about the cursor elements.
     */
    onDetach(cursors: Cursors): void;

    /**
     * Instructs the handler to place the bar cursor for the given beat bounds instantly .
     * @param barCursor The bar cursor.
     * @param beatBounds The bounds of the currently active beat.
     */
    placeBarCursor(barCursor: IContainer, beatBounds: BeatBounds): void;

    /**
     * Instructs the handler to place the beat cursor for the given beat bounds instantly.
     * @param barCursor The beat cursor.
     * @param beatBounds The bounds of the currently active beat.
     */
    placeBeatCursor(beatCursor: IContainer, beatBounds: BeatBounds, startBeatX: number): void;

    /**
     * Instructs the handler to initiate a transition of the beat cursor (e.g. for dynamic animation).
     * @param beatCursor The beat cursor
     * @param beatBounds The bounds of the currently active beat.
     * @param startBeatX The X-position where the transition of the beat cursor should start.
     * @param nextBeatX The X-position where the transition of the beat cursor should end
     * (typically the next beat or end of bar depending on the cursor mode and seeks)
     * @param duration The duration in milliseconds on how long the transition should take.
     * @param cursorMode The active cursor mode for the cursor placement.
     */
    transitionBeatCursor(
        beatCursor: IContainer,
        beatBounds: BeatBounds,
        startBeatX: number,
        nextBeatX: number,
        duration: number,
        cursorMode: MidiTickLookupFindBeatResultCursorMode
    ): void;
}

/**
 * A cursor handler which animates the beat cursor to the next beat or end of the beat bounds
 * depending on the cursor mode.
 * @internal
 */
export class ToNextBeatAnimatingCursorHandler implements ICursorHandler {
    public onAttach(_cursors: Cursors): void {
        // nothing to do
    }

    public onDetach(_cursors: Cursors): void {
        // nothing to do
    }

    public placeBeatCursor(beatCursor: IContainer, beatBounds: BeatBounds, startBeatX: number): void {
        const barBoundings = beatBounds.barBounds.masterBarBounds;
        const barBounds = barBoundings.visualBounds;
        beatCursor.transitionToX(0, startBeatX);
        beatCursor.setBounds(startBeatX, barBounds.y, 1, barBounds.h);
    }

    public placeBarCursor(barCursor: IContainer, beatBounds: BeatBounds): void {
        const barBoundings = beatBounds.barBounds.masterBarBounds;
        const barBounds = barBoundings.visualBounds;
        barCursor.setBounds(barBounds.x, barBounds.y, barBounds.w, barBounds.h);
    }

    public transitionBeatCursor(
        beatCursor: IContainer,
        _beatBounds: BeatBounds,
        startBeatX: number,
        nextBeatX: number,
        duration: number,
        cursorMode: MidiTickLookupFindBeatResultCursorMode
    ): void {
        // it can happen that the cursor reaches the target position slightly too early (especially on backing tracks)
        // to avoid the cursor stopping, causing a wierd look, we animate the cursor to the double position in double time.
        // beatCursor!.transitionToX((duration / cursorSpeed), nextBeatX);
        const factor = cursorMode === MidiTickLookupFindBeatResultCursorMode.ToNextBext ? 2 : 1;
        nextBeatX = startBeatX + (nextBeatX - startBeatX) * factor;
        duration = duration * factor;

        // we need to put the transition to an own animation frame
        // otherwise the stop animation above is not applied.
        beatCursor!.transitionToX(duration, nextBeatX);
    }
}

/**
 * A cursor handler which just places the bar and beat cursor without any animations applied.
 * @internal
 */
export class NonAnimatingCursorHandler implements ICursorHandler {
    public onAttach(_cursors: Cursors): void {
        // nothing to do
    }

    public onDetach(_cursors: Cursors): void {
        // nothing to do
    }

    public placeBeatCursor(beatCursor: IContainer, beatBounds: BeatBounds, startBeatX: number): void {
        const barBoundings = beatBounds.barBounds.masterBarBounds;
        const barBounds = barBoundings.visualBounds;
        beatCursor.transitionToX(0, startBeatX);
        beatCursor.setBounds(startBeatX, barBounds.y, 1, barBounds.h);
    }

    public placeBarCursor(barCursor: IContainer, beatBounds: BeatBounds): void {
        const barBoundings = beatBounds.barBounds.masterBarBounds;
        const barBounds = barBoundings.visualBounds;
        barCursor.setBounds(barBounds.x, barBounds.y, barBounds.w, barBounds.h);
    }

    public transitionBeatCursor(
        beatCursor: IContainer,
        beatBounds: BeatBounds,
        startBeatX: number,
        _nextBeatX: number,
        _duration: number,
        _cursorMode: MidiTickLookupFindBeatResultCursorMode
    ): void {
        this.placeBeatCursor(beatCursor, beatBounds, startBeatX);
    }
}
