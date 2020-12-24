import { AlphaTabError } from "@src/alphatab";
import { AlphaTabErrorType } from "@src/AlphaTabError";

/**
 * Represents a data writer to write data structures into a JSON-alike object hierarchy for further serialization.
 * @partial
 */
export class JsonWriter {
    private _objectStack: unknown[] = [];
    private _currentPropertyName: string = '';

    public result: Map<string, unknown> | null = null;

    public startObject(): void {
        if (this._objectStack.length > 0) {
            const newObject = new Map<string, unknown>();
            const currentObject = this._objectStack[this._objectStack.length - 1];
            this._objectStack.push(newObject);

            if (Array.isArray(currentObject)) {
                currentObject.push(newObject);
            } else {
                (currentObject as Map<string, unknown>).set(this._currentPropertyName, newObject);
            }
        } else {
            this.result = new Map<string, unknown>();
            this._objectStack.push(this.result);
        }
    }

    public endObject(): void {
        this._objectStack.pop();
    }

    public startArray(): void {
        if (this._objectStack.length > 0) {
            const newObject: unknown[] = [];
            const currentObject = this._objectStack[this._objectStack.length - 1];
            this._objectStack.push(newObject);

            if (Array.isArray(currentObject)) {
                currentObject.push(newObject);
            } else {
                (currentObject as Map<string, unknown>).set(this._currentPropertyName, newObject);
            }
        } else {
            throw new AlphaTabError(AlphaTabErrorType.General, 'Root object to be serialized cannot be an array');
        }
    }

    public endArray(): void {
        this._objectStack.pop();
    }

    public prop(name: unknown): void {
        this._currentPropertyName = (name as object).toString();
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
        this.writeValue(this.enumToNumber(value), propName);
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
            } else {
                if (typeof propName === 'undefined') {
                    propName = this._currentPropertyName;
                }
                (currentObject as Map<string, unknown>).set((propName as object).toString(), value);
            }
        } else {
            throw new AlphaTabError(AlphaTabErrorType.General, 'Root object to be serialized cannot be a plain value');
        }
    }

    /**
     * @target web
     */
    private enumToNumber<T>(value: T): number | null {
        return value as unknown as number;
    }
}