/**
 * @public
 */
export class BaseAngle {
    public id: number = 0;
}

/**
 * @public
 */
export class SpecialAngle extends BaseAngle {
    public label: string = '';
}

/**
 * @public
 */
export class AngleCast {
    public downcast(item: BaseAngle): SpecialAngle {
        return <SpecialAngle>item;
    }
}
