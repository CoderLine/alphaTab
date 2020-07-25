import { BendPoint } from '@src/model/BendPoint';

export class TabBendRenderPoint extends BendPoint {
    public lineValue: number = 0;

    public constructor(offset: number = 0, value: number = 0) {
        super(offset, value);
        this.lineValue = value;
    }
}
