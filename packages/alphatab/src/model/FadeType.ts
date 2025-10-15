/**
 * Lists the different fade types.
 * @public
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
