/**
 * This public class is used to describe the beginning of a
 * section within a song. It acts like a marker.
 * @json
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
}
