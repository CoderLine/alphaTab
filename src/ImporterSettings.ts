/**
 * All settings related to importers that decode file formats.
 * @json
 * @json_declaration
 */
export class ImporterSettings {
    /**
     * The text encoding to use when decoding strings. By default UTF-8 is used.
     * @since 0.9.6
     * @default 'utf-8'
     * @summary The text encoding to use when decoding strings.
     */
    public encoding: string = 'utf-8';

    /**
     * If part-groups should be merged into a single track.
     * @since 0.9.6
     * @default false
     * @summary If part-groups should be merged into a single track (MusicXML).
     */
    public mergePartGroupsInMusicXml: boolean = false;

    /**
     * If set to true, text annotations on beats are attempted to be parsed as
     * lyrics considering spaces as separators and removing underscores.
     * If a track/staff has explicit lyrics the beat texts will not be detected as lyrics.
     * @since 1.2.0
     * @default false
     * @summary Enables detecting lyrics from beat texts
     */
    public beatTextAsLyrics: boolean = false;
}
