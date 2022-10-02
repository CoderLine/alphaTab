import { ModelUtils } from "@src/model/ModelUtils";

/**
 * This eventargs define the details about the rendering and layouting process and are
 * provided whenever a part of of the music sheet is rendered.
 */
export class RenderFinishedEventArgs {
    /**
     * Gets or sets the unique id of this event args.
     */
    public id: string = ModelUtils.newGuid();
    /**
     * Gets or sets the x position of the current rendering result.
     */
    public x: number = 0;

    /**
     * Gets or sets the y position of the current rendering result.
     */
    public y: number = 0;

    /**
     * Gets or sets the width of the current rendering result.
     */
    public width: number = 0;

    /**
     * Gets or sets the height of the current rendering result.
     */
    public height: number = 0;

    /**
     * Gets or sets the currently known total width of the final music sheet.
     */
    public totalWidth: number = 0;

    /**
     * Gets or sets the currently known total height of the final music sheet.
     */
    public totalHeight: number = 0;

    /**
     * Gets or sets the index of the first masterbar that was rendered in this result.
     */
    public firstMasterBarIndex: number = -1;

    /**
     * Gets or sets the index of the last masterbar that was rendered in this result.
     */
    public lastMasterBarIndex: number = -1;

    /**
     * Gets or sets the render engine specific result object which contains the rendered music sheet.
     */
    public renderResult: unknown = null;
}
