/**
 * This public enum lists all different types of finger slide-outs on a string.
 */
export enum SlideOutType {
    /**
     * No slide.
     */
    None,
    /**
     * Shift slide to next note on same string
     */
    Shift,
    /**
     * Legato slide to next note on same string.
     */
    Legato,
    /**
     * Slide out from the note from upwards on the same string.
     */
    OutUp,
    /**
     * Slide out from the note from downwards on the same string.
     */
    OutDown,
    /**
     * Pickslide down on this note
     */
    PickSlideDown,
    /**
     * Pickslide up on this note
     */
    PickSlideUp
}
