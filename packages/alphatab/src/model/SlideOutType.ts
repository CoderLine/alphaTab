/**
 * This public enum lists all different types of finger slide-outs on a string.
 */
export enum SlideOutType {
    /**
     * No slide.
     */
    None = 0,
    /**
     * Shift slide to next note on same string
     */
    Shift = 1,
    /**
     * Legato slide to next note on same string.
     */
    Legato = 2,
    /**
     * Slide out from the note from upwards on the same string.
     */
    OutUp = 3,
    /**
     * Slide out from the note from downwards on the same string.
     */
    OutDown = 4,
    /**
     * Pickslide down on this note
     */
    PickSlideDown = 5,
    /**
     * Pickslide up on this note
     */
    PickSlideUp = 6
}
