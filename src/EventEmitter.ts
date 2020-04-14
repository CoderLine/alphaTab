export interface IEventEmitter<TFunction extends Function> {
    on(value: TFunction): void;

    off(value: TFunction): void;
}

export class EventEmitter<TFunction extends Function> implements IEventEmitter<TFunction> {
    private _listeners: TFunction[] = [];

    public on(value: TFunction): void {
        this._listeners.push(value);
    }

    public off(value: TFunction): void {
        this._listeners = this._listeners.filter(l => l !== value);
    }

    public trigger(...args: any[]): void {
        for (const l of this._listeners) {
            l(...args);
        }
    }
}
