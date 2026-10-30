import type { Bar } from '@coderline/alphatab/model/Bar';
import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Note } from '@coderline/alphatab/model/Note';

/**
 * The sink the layout writes the bounds of a render into. All positions and sizes are already scaled.
 *
 * Per render: {@link begin}, then any number of staff systems, {@link clearFromMasterBar} only between
 * systems, and {@link finish} once the render is done. Per staff system the calls are nested as
 * `beginStaffSystem (openMasterBar | addMasterBar) addBar (addBeat addNote*)* endBar ... endStaffSystem`.
 * The writer orders the bars of a master bar and the beats of a bar by position, so callers write them
 * in any order.
 * @internal
 */
export interface IBoundsLookupWriter {
    /**
     * Whether the current lookup is complete; the layout writes no staff systems into a finished lookup.
     */
    readonly isFinished: boolean;

    /**
     * Starts the lookup of a render.
     * @param partialUpdate Whether to keep the staff systems of the previous render (if there was one) for a
     * partial update, which removes the rebuilt range via {@link clearFromMasterBar}. When the layout lays out
     * all systems instead, it calls {@link begin} again without partial update before the first staff system.
     */
    begin(partialUpdate: boolean): void;

    /**
     * Removes the staff systems starting at or after the given master bar.
     */
    clearFromMasterBar(masterBarIndex: number): void;

    /**
     * Marks the lookup as complete.
     */
    finish(scale: number): void;

    beginStaffSystem(x: number, y: number, w: number, visualH: number, realH: number): void;

    /**
     * Makes the master bar with the given index of the current staff system the target of {@link addBar}.
     * @param hint The position of the master bar within the system when known, to skip the search.
     * @returns false if the current system has no master bar with this index yet.
     */
    openMasterBar(index: number, hint: number): boolean;

    /**
     * Adds a master bar to the current staff system and makes it the target of {@link addBar}.
     */
    addMasterBar(
        index: number,
        isFirstOfLine: boolean,
        x: number,
        w: number,
        realY: number,
        realH: number,
        visualY: number,
        visualH: number,
        lineAlignedY: number,
        lineAlignedH: number
    ): void;

    /**
     * Adds a bar to the current master bar; its visual and real bounds are the same.
     */
    addBar(bar: Bar, x: number, y: number, w: number, h: number): void;

    /**
     * Adds a beat to the current bar; its bounds span the bar vertically.
     */
    addBeat(beat: Beat, visualX: number, visualW: number, realX: number, realW: number, onNotesX: number): void;

    /**
     * Adds the note head bounds of a note to the current beat.
     */
    addNote(note: Note, x: number, y: number, w: number, h: number): void;

    endBar(): void;

    endStaffSystem(): void;
}
