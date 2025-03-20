/**
 * All settings related to importers that decode file formats.
 * @json
 * @json_declaration
 */
export class ImporterSettings {
    /**
     * The text encoding to use when decoding strings.
     * @since 0.9.6
     * @defaultValue `utf-8`
     * @category Importer
     * @remarks
     * By default strings are interpreted as UTF-8 from the input files. This is sometimes not the case and leads to strong display
     * of strings in the rendered notation. Via this setting the text encoding for decoding the strings can be changed. The supported
     * encodings depend on the browser or operating system. This setting is considered for the importers
     * 
     * * Guitar Pro 7
     * * Guitar Pro 6
     * * Guitar Pro 3-5
     * * MusicXML
     */
    public encoding: string = 'utf-8';

    /**
     * If part-groups should be merged into a single track (MusicXML).
     * @since 0.9.6
     * @defaultValue `false`
     * @category Importer
     * @remarks
     * This setting controls whether multiple `part-group` tags will result into a single track with multiple staves. 
     */
    public mergePartGroupsInMusicXml: boolean = false;

    /**
     * Enables detecting lyrics from beat texts
     * @since 1.2.0
     * @category Importer
     * @defaultValue `false`
     * @remarks
     * 
     * On various old Guitar Pro 3-5 files tab authors often used the "beat text" feature to add lyrics to the individual tracks. 
     * This was easier and quicker than using the lyrics feature. 
     * 
     * These texts were optimized to align correctly when viewed in Guitar Pro with the default layout but can lead to 
     * disturbed display in alphaTab. When `beatTextAsLyrics` is set to true, alphaTab will try to rather parse beat text 
     * values as lyrics using typical text patterns like dashes, underscores and spaces. 
     * 
     * The lyrics are only detected if not already proper lyrics are applied to the track.
     * 
     * Enable this option for input files which suffer from this practice.
     * 
     * > [!NOTE]
     * > alphaTab tries to relate the texts and chunks to the beats but this is not perfect. 
     * > Errors are likely to happen with such kind of files.
     * 
     * **Enabled**
     * 
     * ![Enabled](https://alphatab.net/img/reference/property/beattextaslyrics-enabled.png)
     *
     * **Disabled**
     * 
     * ![Disabled](https://alphatab.net/img/reference/property/beattextaslyrics-disabled.png)
     */
    public beatTextAsLyrics: boolean = false;
}
