/**
 * All settings related to exporters that encode file formats.
 * @json
 * @json_declaration
 */
export class ExporterSettings {
    /**
     * How many characters should be indented on formatted outputs. If set to negative values
     * formatted outputs are disabled.
     * @since 1.7.0
     * @defaultValue `2`
     * @category Exporter
     */
    public indent: number = 2;

    /**
     * Whether to write extended comments into the exported file (e.g. to in alphaTex to mark where certain metadata or bars starts)
     * @since 1.7.0
     * @defaultValue `false`
     * @category Exporter
     */
    public comments: boolean = false;
}

