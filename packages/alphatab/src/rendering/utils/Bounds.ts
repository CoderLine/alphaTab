/**
 * Represents a rectangular area within the renderer music notation.
 */
export class Bounds {
    /**
     * Gets or sets the X-position of the rectangle within the music notation.
     */
    public x: number = 0;

    /**
     * Gets or sets the Y-position of the rectangle within the music notation.
     */
    public y: number = 0;

    /**
     * Gets or sets the width of the rectangle.
     */
    public w: number = 0;

    /**
     * Gets or sets the height of the rectangle.
     */
    public h: number = 0;

    public scaleWith(scale: number) {
        this.x *= scale;
        this.y *= scale;
        this.w *= scale;
        this.h *= scale;
    }
}
