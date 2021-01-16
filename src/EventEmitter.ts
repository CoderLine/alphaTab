export interface IEventEmitter {
    on(value: () => void): void;
    off(value: () => void): void;
}

/**
 * @partial
 */
export interface IEventEmitterOfT<T> {
    on(value: (arg: T) => void): void;
    off(value: (arg: T) => void): void;
}

export class EventEmitter implements IEventEmitter {
    private _listeners: (() => void)[] = [];

    public on(value: () => void): void {
        this._listeners.push(value);
    }

    public off(value: () => void): void {
        this._listeners = this._listeners.filter(l => l !== value);
    }

    public trigger(): void {
        for (const l of this._listeners) {
            l();
        }
    }
}

/**
 * @partial
 */
export class EventEmitterOfT<T> implements IEventEmitterOfT<T> {
    private _listeners: ((arg: T) => void)[] = [];

    public on(value: (arg: T) => void): void {
        this._listeners.push(value);
    }

    public off(value: (arg: T) => void): void {
        this._listeners = this._listeners.filter(l => l !== value);
    }

    public trigger(arg: T): void {
        for (const l of this._listeners) {
            l(arg);
        }
    }
}
