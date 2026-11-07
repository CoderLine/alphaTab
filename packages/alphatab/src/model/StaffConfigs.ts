import type { ElementDisplay } from '@coderline/alphatab/model/ElementDisplay';
import type { BarNumberDisplay } from '@coderline/alphatab/model/RenderStylesheet';
import type { TabRhythmMode } from '@coderline/alphatab/NotationSettings';

/**
 * Per-staff-type display configuration for the standard-notation staff.
 * @since 1.9.0
 * @record
 * @json
 * @public
 */
export interface ScoreStaffConfig {
    clef?: ElementDisplay;
    keySignature?: ElementDisplay;
    timeSignature?: ElementDisplay;
    barNumber?: BarNumberDisplay;
}

/**
 * Per-staff-type display configuration for the tablature staff.
 * @since 1.9.0
 * @record
 * @json
 * @public
 */
export interface TabStaffConfig {
    clef?: ElementDisplay;
    timeSignature?: ElementDisplay;
    barNumber?: BarNumberDisplay;
    rhythm?: TabRhythmMode;
    rests?: ElementDisplay;
}

/**
 * Per-staff-type display configuration for the slash staff.
 * @since 1.9.0
 * @record
 * @json
 * @public
 */
export interface SlashStaffConfig {
    keySignature?: ElementDisplay;
    timeSignature?: ElementDisplay;
    barNumber?: BarNumberDisplay;
}

/**
 * Lists the modes how the notes of a beat are written on the numbered (jianpu) staff.
 * @since 1.10.0
 * @public
 */
export enum NumberedNoteMode {
    /**
     * Every voice is written on its own row and chords are written as stacked numbers,
     * the lowest note at the bottom.
     */
    AllNotes = 0,
    /**
     * Only the first voice is written, with a single number per beat showing the highest note of a chord.
     */
    SingleNote = 1
}

/**
 * Per-staff-type display configuration for the numbered (jianpu) staff.
 * The "1=X" key designation is rendered as an above-staff effect-band
 * label, not a header glyph, so this config has no `keySignature` field.
 * @since 1.9.0
 * @record
 * @json
 * @public
 */
export interface NumberedStaffConfig {
    timeSignature?: ElementDisplay;
    barNumber?: BarNumberDisplay;
    /**
     * How the notes of the voices and chords are written.
     * @since 1.10.0
     */
    notes?: NumberedNoteMode;
}
