/**
 * Lists the different data types JSON properties can have.
 */
export enum JsonValueType {
    /**
     * The json value is a simple string.
     */
    String,
    /**
     * The json value is a number.
     */
    Number,
    /**
     * The json value is a boolean.
     */
    Boolean,
    /**
     * The json value is null.
     */
    Null,
    /**
     * The json value is a nested object.
     */
    Object,
    /**
     * The json value is a nested array.
     */
    Array
}

/**
 * @partial 
 */
class ReaderStackItem {
    public obj: unknown;
    public currentIndex: number = -1;

    // for object iteration
    public currentProp: string = '';
    public currentValue: unknown = null;

    public currentObjectKeys: string[];

    public constructor(obj: unknown) {
        if (obj) {
            if (Array.isArray(obj)) {
                this.currentObjectKeys = [];
            } else {
                if (!(obj instanceof Map)) {
                    obj = ReaderStackItem.objectToMap(obj as object);
                }
                this.currentObjectKeys = Array.from((obj as Map<string, unknown>).keys());
            }
        } else {
            this.currentObjectKeys = [];
        }


        this.obj = obj;
    }

    /**
     * @target web
     */
    private static objectToMap(obj: object | null): Map<string, unknown> {
        return new Map<string, unknown>(Object.entries(obj as any))
    }
}

/**
 * Represents a data reader to read data structures from a JSON-alike source structure. 
 * @partial
 */
export class JsonReader {
    private _currentItem: ReaderStackItem | null = null;
    private _readStack: ReaderStackItem[] = [];

    /**
     * Gets the data type of the current item at which the reader is placed. 
     * This is usually either the current property of an object or the current item in an array. 
     */
    public currentValueType: JsonValueType = JsonValueType.Null;

    public constructor(root: any) {
        const map = new Map<string, unknown>();
        map.set("root", root);
        this.setCurrentObject(map);
        this.nextProp();
    }

    /**
     * Reads the current object property name as string. 
     * Requires that an object is currently being read. 
     */
    public prop(): string {
        return this._currentItem?.currentProp ?? "";
    }

    /**
     * Reads the current object property name as enum value.
     * This works for either number or string based keys. 
     * @param enumType The type of the enum which defines the values of T
     */
    public enumProp<T extends number>(enumType: unknown): T {
        const prop = this.prop();
        const num = parseInt(prop);
        return isNaN(num)
            ? this.parseEnum<T>(prop, enumType)
            : num as unknown as T;
    }

    /**
     * Reads the current object property as number value.
     */
    public numberProp(): number {
        const prop = this.prop();
        return parseInt(prop);
    }

    /**
     * Advances the reader to the next property within the currently read object. 
     */
    public nextProp(): boolean {
        const currentItem = this._currentItem!;
        currentItem.currentIndex++;
        if (currentItem.currentIndex < currentItem.currentObjectKeys.length) {
            currentItem.currentProp = currentItem.currentObjectKeys[currentItem.currentIndex];
            currentItem.currentValue = (currentItem.obj as Map<string, unknown>).get(currentItem.currentProp);
            this.updateCurrentValueType(currentItem.currentValue);
            return true;
        } else {
            this.currentValueType = JsonValueType.Null;
            return false;
        }
    }

    /**
     * Advances the reader to the next item within the currently read array. 
     */
    public nextItem(): boolean {
        const currentItem = this._currentItem!;
        currentItem.currentIndex++;

        if (Array.isArray(currentItem.obj) &&
            currentItem.currentIndex < (currentItem.obj as any[]).length) {
            currentItem.currentValue = (currentItem.obj as any[])[currentItem.currentIndex];
            this.updateCurrentValueType(currentItem.currentValue);
            return true;
        } else {
            return false;
        }
    }

    /**
    * Starts reading of a nested object. 
    */
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

    /**
     * Completes the reading of a nested object. 
     */
    public endObject(): void {
        this._readStack.pop();
        this._currentItem = this._readStack[this._readStack.length - 1];
    }

    /**
     * Starts the reading of a nested array. 
     */
    public startArray(): void {
        this.startObject();
    }

    /**
     * Completes the reading of a nested array.
     */
    public endArray(): void {
        this.endObject();
    }

    /**
     * Reads the current property value as a raw unknown value without further parsing. 
     * @returns the current raw property value 
     */
    public unknown(): unknown {
        return this.value<unknown>(this.currentValueType);
    }

    /**
     * Reads the current property value as string.
     * @returns the current property value if it is a string or null if it is a different type. 
     */
    public string(): string | null {
        return this.value<string>(JsonValueType.String);
    }

    /**
     * Reads the current property value as enum.
     * Number and case-insenstive strings are supported. 
     * @returns the current property value as enum or null if it could not be parsed. 
     */
    public enum<T extends number>(enumType: any): T | null {
        const currentItem = this._currentItem;
        if (currentItem) {
            switch (this.currentValueType) {
                case JsonValueType.String:
                    return this.parseEnum<T>(currentItem.currentValue as string, enumType);
                case JsonValueType.Number:
                    return this.numberToEnum<T>(currentItem.currentValue as number);
            }
        }
        return null;
    }

    /**
     * Reads the current property value as number.
     * @returns the current property value if it is a number or null if it is a different type. 
     */
    public number(): number | null {
        return this.valueStruct<number>(JsonValueType.Number);
    }

    /**
     * Reads the current property value as boolean.
     * @returns the current property value if it is a boolean or null if it is a different type. 
     */
    public boolean(): boolean | null {
        return this.valueStruct<boolean>(JsonValueType.Boolean);
    }

    /**
     * Reads the current property value as string array.
     * @returns the current property value if it is an array or null if it is a different type. 
     */
    public stringArray(): string[] | null {
        return this.value<string[]>(JsonValueType.Array);
    }

    /**
     * Reads the current property value as number array.
     * @returns the current property value if it is an array or null if it is a different type. 
     */
    public numberArray(): number[] | null {
        return this.value<number[]>(JsonValueType.Array);
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
        const obj = new ReaderStackItem(current);
        this._readStack.push(obj);
        this._currentItem = obj;
    }

    // required for C# generation where nullable struct/classes need separate methods
    private valueStruct<T extends number | boolean>(type: JsonValueType): T | null {
        const currentItem = this._currentItem;
        if (currentItem && this.currentValueType === type) {
            return currentItem.currentValue as T;
        }
        return null;
    }

    private value<T extends unknown>(type: JsonValueType): T | null {
        const currentItem = this._currentItem;
        if (currentItem && this.currentValueType === type) {
            return currentItem.currentValue as T;
        }
        return null;
    }

    /**
     * @target web
     */
    private parseEnum<T>(value: string, enumType: any): T {
        return enumType[Object.keys(enumType).find(k => k.toLowerCase() === value.toLowerCase()) as any] as any;
    }

    /**
     * @target web
     */
    private numberToEnum<T>(value: number): T {
        return value as unknown as T;
    }
}