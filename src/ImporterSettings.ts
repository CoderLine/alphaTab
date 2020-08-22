/**
 * All settings related to importers that decode file formats.
 * @json
 */
export class ImporterSettings {
    /**
     * The text encoding to use when decoding strings. By default UTF-8 is used.
     */
    public encoding: string = 'utf-8';

    /**
     * If part-groups should be merged into a single track.
     */
    public mergePartGroupsInMusicXml: boolean = false;

    /**
     * Controls whether anacrusis should be auto-detected based on the completeness of bars.
     */
    public detectAnacrusis: boolean = false;
}
