import type { ElementDisplay } from '@coderline/alphatab/model/ElementDisplay';
import type { BarNumberDisplay } from '@coderline/alphatab/model/RenderStylesheet';
import type { TabRhythmMode } from '@coderline/alphatab/NotationSettings';

/**
 * Per-staff-type display configuration for the standard-notation staff.
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
 * Per-staff-type display configuration for the numbered (jianpu) staff.
 * The "1=X" key designation is rendered as an above-staff effect-band
 * label, not a header glyph, so this config has no `keySignature` field.
 * @record
 * @json
 * @public
 */
export interface NumberedStaffConfig {
    timeSignature?: ElementDisplay;
    barNumber?: BarNumberDisplay;
}
