/**
 * Lists all layout modes that are supported.
 * @public
 */
export enum LayoutMode {
    /**
     * The bars are aligned in an [vertically endless page-style fashion](https://alphatab.net/docs/showcase/layouts#page-layout)
     */
    Page = 0,
    /**
     * Bars are aligned horizontally in [one horizontally endless system (row)](https://alphatab.net/docs/showcase/layouts#horizontal-layout)
     *
     * alphaTab holds following information in the data model and developers can change those values (e.g. by tapping into the `scoreLoaded`) event.
     * These widths are respected when using this layout.
     *
     * **Used when single tracks are rendered:**
     *
     * * `score.tracks[index].staves[index].bars[index].displayWidth` - The absolute size of this bar when displayed.
     *
     * **Used when multiple tracks are rendered:**
     *
     * * `score.masterBars[index].displayWidth` - Like the `displayWidth` on bar level.
     */
    Horizontal = 1,
    /**
     * The bars are aligned in an [vertically endless page-style fashion](https://alphatab.net/docs/showcase/layouts#parchment)
     * respecting the configured systems layout.
     * 
     * The parchment layout uses the `systemsLayout` and `defaultSystemsLayout` to decide how many bars go into a single system (row).
     * Additionally when sizing the bars within the system the `displayScale` is used. This scale is rather a ratio than an absolute percentage value but percentages work also:
     *
     * ![Parchment Layout](https://alphatab.net/img/reference/property/systems-layout-page-examples.png)
     *
     * File formats like Guitar Pro embed information about the layout in the file and alphaTab can read and use this information.
     *
     * alphaTab holds following information in the data model and developers can change those values (e.g. by tapping into the `scoreLoaded`) event.
     *
     * **Used when single tracks are rendered:**
     *
     * * `score.tracks[index].systemsLayout` - An array of numbers describing how many bars should be placed within each system (row).
     * * `score.tracks[index].defaultSystemsLayout` - The number of bars to place in a system (row) when no value is defined in the `systemsLayout`.
     * * `score.tracks[index].staves[index].bars[index].displayScale` - The relative size of this bar in the system it is placed. Note that this is not directly a percentage value. e.g. if there are 3 bars and all define scale 1, they are sized evenly.
     *
     * **Used when multiple tracks are rendered:**
     *
     * * `score.systemsLayout` - Like the `systemsLayout` on track level.
     * * `score.defaultSystemsLayout` - Like the `defaultSystemsLayout` on track level.
     * * `score.masterBars[index].displayScale` - Like the `displayScale` on bar level.
     */
    Parchment = 2
}
