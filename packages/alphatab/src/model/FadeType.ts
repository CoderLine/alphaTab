/**
 * Lists the different fade types.
 */
export enum FadeType {
    /**
     * No fading
     */
    None = 0,
    /**
     * Fade-in the sound.
     */
    FadeIn = 1,
    /**
     * Fade-out the sound.
     */
    FadeOut = 2,
    /**
     * Fade-in and then fade-out the sound.
     */
    VolumeSwell = 3
}
