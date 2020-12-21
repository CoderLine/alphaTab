export enum JsonValueType {
    String,
    Number,
    Boolean,
    Null,
    Object,
    Array
}

export interface IJsonReader {
    readonly currentValueType: JsonValueType;

    startObject(): void;
    endObject(): void;

    startArray(): void;
    endArray(): void;

    prop(): string;
    enumProp<T>(enumType: any): T;
    numberProp(): number;

    nextProp(): boolean;
    nextItem(): boolean;

    string(): string | null;
    enum<T>(enumType: any): T | null;
    number(): number | null;
    boolean(): boolean | null;

    stringArray(): string[] | null;
    numberArray(): number[] | null;
}

interface ReaderStackItem {
    obj: any;
    currentIndex: number;

    // for object iteration
    currentProp?: string;
    currentValue?: any;

    currentObjectKeys: string[];
}

export class JsonObjectReader implements IJsonReader {
    private _currentItem: ReaderStackItem | null = null;
    private _readStack: ReaderStackItem[] = [];

    public currentValueType: JsonValueType = JsonValueType.Null;

    public constructor(root: any) {
        root = {
            root: root
        };
        this.setCurrentObject(root);
        this.nextProp();
    }

    private updateCurrentValueType(val: any) {
        switch (typeof val) {
            case 'undefined':
                this.currentValueType = JsonValueType.Null;
                break;
            case 'string':
                this.currentValueType = JsonValueType.String;
                break;
            case 'object':
                if (val === null) {
                    this.currentValueType = JsonValueType.Null;
                } else if (Array.isArray(val)) {
                    this.currentValueType = JsonValueType.Array;
                } else {
                    this.currentValueType = JsonValueType.Object;
                }
                break;
            case 'number':
                this.currentValueType = JsonValueType.Number;
                break;
            case 'boolean':
                this.currentValueType = JsonValueType.Boolean;
                break;
        }
    }

    private setCurrentObject(current: any) {
        let currentObjectKeys: string[] = typeof current === 'object' && current !== null
            ? Object.keys(current)
            : [];
        const obj = {
            obj: current,
            currentIndex: -1,
            currentObjectKeys: currentObjectKeys
        };
        this._readStack.push(obj);
        this._currentItem = obj;
    }

    public prop(): string {
        return this._currentItem?.currentProp ?? "";
    }

    private parseEnum<T>(value: string, enumType: any): T {
        return enumType[Object.keys(enumType).find(k => k.toLowerCase() === value.toLowerCase()) as any] as any;
    }

    public enumProp<T>(enumType: any): T {
        const prop = this.prop();
        const num = parseInt(prop);
        return isNaN(num)
            ? this.parseEnum<T>(prop, enumType)
            : num as any;
    }

    public numberProp(): number {
        const prop = this.prop();
        return parseInt(prop);
    }

    public nextProp(): boolean {
        const currentItem = this._currentItem!;
        currentItem.currentIndex++;
        if (currentItem.currentIndex < currentItem.currentObjectKeys.length) {
            currentItem.currentProp = currentItem.currentObjectKeys[currentItem.currentIndex];
            currentItem.currentValue = currentItem.obj[currentItem.currentProp];
            this.updateCurrentValueType(currentItem.currentValue);
            return true;
        } else {
            this.currentValueType = JsonValueType.Null;
            return false;
        }
    }

    public nextItem(): boolean {
        const currentItem = this._currentItem!;
        currentItem.currentIndex++;

        if (Array.isArray(currentItem.obj) &&
            currentItem.currentIndex < currentItem.obj.length) {
            currentItem.currentValue = currentItem.obj[currentItem.currentIndex];
            this.updateCurrentValueType(currentItem.currentValue);
            return true;
        } else {
            return false;
        }
    }


    public startObject(): void {
        const currentItem = this._currentItem;
        if (currentItem) {
            switch (this.currentValueType) {
                case JsonValueType.Object:
                    this.setCurrentObject(currentItem.currentValue!);
                    break;
                case JsonValueType.Array:
                    this.setCurrentObject(currentItem.currentValue!);
                    break;
                default:
                    throw new Error(`Cannot start object/array in the current item. item is a ${JsonValueType[this.currentValueType]}`);
            }
        }
    }

    public endObject(): void {
        this._readStack.pop();
        this._currentItem = this._readStack[this._readStack.length - 1];
    }

    public startArray(): void {
        this.startObject();
    }

    public endArray(): void {
        this.endObject();
    }

    public string(): string | null {
        return this.value<string>(JsonValueType.String);
    }

    public enum<T>(enumType: any): T | null {
        const currentItem = this._currentItem;
        if (currentItem) {
            switch (this.currentValueType) {
                case JsonValueType.String:
                    return this.parseEnum<T>(currentItem.currentValue as string, enumType);
                case JsonValueType.Number:
                    return currentItem.currentValue as any;
            }
        }
        return null;
    }

    public number(): number | null {
        return this.value<number>(JsonValueType.Number);
    }

    public boolean(): boolean | null {
        return this.value<boolean>(JsonValueType.Boolean);
    }

    public stringArray(): string[] | null {
        return this.value<string[]>(JsonValueType.Array);
    }

    public numberArray(): number[] | null {
        return this.value<number[]>(JsonValueType.Array);
    }

    private value<T>(type: JsonValueType): T | null {
        const currentItem = this._currentItem;
        if (currentItem && this.currentValueType === type) {
            return currentItem.currentValue as T;
        }
        return null;
    }
}