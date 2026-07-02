/**
 * Spatial selector for an element across the staves of a system.
 *
 * One axis of {@link ElementDisplay}. The renderer dispatches per-staff
 * on this axis to decide which staves paint the element.
 * @public
 */
export enum StaffPlacement {
    /**
     * Paint the element on every staff whose
     * {@link ElementDisplay.isVisible} resolves to `true`.
     */
    AllStaves = 0,
    /**
     * Paint only on the cascade-primary render-staff for each model
     * {@link Staff}. Priority: `score → tab → slash → numbered`.
     */
    Primary = 1
}

/**
 * Temporal selector for an element across the systems of the score.
 *
 * One axis of {@link ElementDisplay}. Independent of
 * {@link StaffPlacement}.
 * @public
 */
export enum SystemDisplay {
    /**
     * Restate the element at the start of every system.
     */
    AllSystems = 0,
    /**
     * Show only on the first system; subsequent systems do not restate.
     */
    FirstSystemOnly = 1
}

/**
 * Per-axis visibility / placement / system-display selector for an
 * element on a staff type. Used as the value type for the clef,
 * key signature, time signature, and rests entries on the per-staff-type
 * configuration carriers.
 *
 * Each axis is independently optional. An `undefined` axis defers to
 * the outer layer in the three-layer resolution chain (per-bar →
 * per-staff → score-wide stylesheet).
 * @record
 * @json
 * @public
 */
export interface ElementDisplay {
    /**
     * Whether to paint the element at all.
     */
    isVisible?: boolean;

    /**
     * Spatial selector across the staves of a system.
     */
    staffPlacement?: StaffPlacement;

    /**
     * Temporal selector across the systems of the score.
     */
    systemDisplay?: SystemDisplay;
}
