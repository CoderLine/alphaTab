/**
 * @public
 */
export class BaseItem {
    public id: number = 0;
}

/**
 * @public
 */
export class SpecialItem extends BaseItem {
    public label: string = '';
}

/**
 * @public
 */
export class Casts {
    public upcast(item: SpecialItem): BaseItem {
        return item as BaseItem;
    }

    public downcast(item: BaseItem): SpecialItem {
        return item as SpecialItem;
    }

    public isString(value: unknown): boolean {
        return typeof value === 'string';
    }

    public isNumber(value: unknown): boolean {
        return typeof value === 'number';
    }
}
