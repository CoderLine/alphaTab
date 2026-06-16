import type { ElementDisplay } from '@coderline/alphatab/model/ElementDisplay';
import type { BarNumberDisplay } from '@coderline/alphatab/model/RenderStylesheet';

/**
 * Per-bar override for the standard-notation staff's display.
 * @record
 * @json
 * @public
 */
export interface ScoreBarOverride {
    clef?: ElementDisplay;
    keySignature?: ElementDisplay;
    timeSignature?: ElementDisplay;
    barNumber?: BarNumberDisplay;
}

/**
 * Per-bar override for the tablature staff's display.
 * @record
 * @json
 * @public
 */
export interface TabBarOverride {
    clef?: ElementDisplay;
    timeSignature?: ElementDisplay;
    barNumber?: BarNumberDisplay;
}

/**
 * Per-bar override for the slash staff's display.
 * @record
 * @json
 * @public
 */
export interface SlashBarOverride {
    keySignature?: ElementDisplay;
    timeSignature?: ElementDisplay;
    barNumber?: BarNumberDisplay;
}

/**
 * Per-bar override for the numbered (jianpu) staff's display.
 * @record
 * @json
 * @public
 */
export interface NumberedBarOverride {
    timeSignature?: ElementDisplay;
    barNumber?: BarNumberDisplay;
}
