/**
 * This class represents the rendering stylesheet.
 * It contains settings which control the display of the score when rendered.
 */
export class RenderStylesheet {
    /**
     * Gets or sets whether dynamics are hidden.
     */
    public hideDynamics: boolean = false;

    public static copyTo(src: RenderStylesheet, dst: RenderStylesheet): void {
        dst.hideDynamics = src.hideDynamics;
    }
}
