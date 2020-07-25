/**
 * This public class is used to describe the beginning of a
 * section within a song. It acts like a marker.
 */
export class Section {
    /**
     * Gets or sets the marker ID for this section.
     */
    public marker: string = '';

    /**
     * Gets or sets the descriptional text of this section.
     */
    public text: string = '';

    public static copyTo(src: Section, dst: Section): void {
        dst.marker = src.marker;
        dst.text = src.text;
    }
}
