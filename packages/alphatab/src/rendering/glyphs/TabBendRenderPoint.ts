import { BendPoint } from '@coderline/alphatab/model/BendPoint';

/**
 * @internal
 */
export class TabBendRenderPoint extends BendPoint {
    public lineValue: number = 0;
    /**
     * How far the value label of the arrow ending at this point is moved up, to stack it above the labels of
     * other notes of the same beat.
     */
    public labelShift: number = 0;
    /**
     * Whether the value label is left out because another note of the same beat shows the same label at the
     * same height.
     */
    public isLabelMerged: boolean = false;

    public constructor(offset: number = 0, value: number = 0) {
        super(offset, value);
        this.lineValue = value;
    }
}
