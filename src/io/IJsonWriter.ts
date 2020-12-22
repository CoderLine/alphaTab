export interface IJsonWriter {
    readonly result: unknown;

    startObject(): void;
    endObject(): void;

    startArray(): void;
    endArray(): void;

    prop(name: unknown): void;

    unknown(value: unknown, propName?: unknown): void;
    string(value: string | null, propName?: unknown): void;
    number(value: number | null, propName?: unknown): void;
    boolean(value: boolean | null, propName?: unknown): void;
    enum<T>(value: T, propName?: unknown): void;
    null(propName?: unknown): void;
    stringArray(value: string[] | null, propName?: unknown): void;
    numberArray(value: number[] | null, propName?: unknown): void;
}

/**
 * @target web
 */
export class JsonObjectWriter implements IJsonWriter {
    private _objectStack: any[] = [];
    private _currentPropertyName: string = '';

    public result: unknown = null;

    public startObject(): void {
        if (this._objectStack.length > 0) {
            const newObject: any = {};
            const currentObject = this._objectStack[this._objectStack.length - 1];
            this._objectStack.push(newObject);

            if (Array.isArray(currentObject)) {
                currentObject.push(newObject);
            } else {
                currentObject[this._currentPropertyName] = newObject;
            }
        } else {
            this.result = {};
            this._objectStack.push(this.result);
        }
    }

    public endObject(): void {
        this._objectStack.pop();
    }

    public startArray(): void {
        if (this._objectStack.length > 0) {
            const newObject: any = [];
            const currentObject = this._objectStack[this._objectStack.length - 1];
            this._objectStack.push(newObject);

            if (Array.isArray(currentObject)) {
                currentObject.push(newObject);
            } else {
                currentObject[this._currentPropertyName] = newObject;
            }
        } else {
            this.result = [];
            this._objectStack.push(this.result);
        }
    }

    public endArray(): void {
        this._objectStack.pop();
    }

    public prop(name: unknown): void {
        this._currentPropertyName = name as any;
    }

    public unknown(value: unknown, propName?: unknown): void {
        this.writeValue(value, propName);
    }

    public string(value: string | null, propName?: unknown): void {
        this.writeValue(value, propName);
    }

    public number(value: number | null, propName?: unknown): void {
        this.writeValue(value, propName);
    }

    public boolean(value: boolean | null, propName?: unknown): void {
        this.writeValue(value, propName);
    }

    public enum<T>(value: T, propName?: unknown): void {
        this.writeValue(value, propName);
    }

    public null(propName?: unknown): void {
        this.writeValue(null, propName);
    }

    public stringArray(value: string[] | null, propName?: unknown): void {
        this.writeValue(value, propName);
    }

    public numberArray(value: number[] | null, propName?: unknown): void {
        this.writeValue(value, propName);
    }

    private writeValue(value: any, propName?: unknown) {
        if (this._objectStack.length > 0) {
            const currentObject = this._objectStack[this._objectStack.length - 1];
            if (Array.isArray(currentObject)) {
                this._objectStack.push(value);
            } else if (typeof propName !== 'undefined') {
                currentObject[propName as any] = value;
            } else {
                currentObject[this._currentPropertyName] = value;
            }
        } else {
            this.result = value;
        }
    }
}