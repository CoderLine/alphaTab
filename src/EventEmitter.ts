/**
 * An emitter for an event without any value passed to the listeners.
 */
export interface IEventEmitter {
    /**
     * Registers to the event with the given handler
     * @param value The function to call when the event occurs.
     * @returns A function which can be called to unregister the registered handler.
     * This is usedful if the original function passed to this is not stored somewhere but
     * unregistering of the event needs to be done.
     */
    on(value: () => void): () => void;
    /**
     * Unregisters the given handler from this event.
     * @param value The value originally passed into {@link on}, NOT the function returned by it.
     */
    off(value: () => void): void;
}

/**
 * An emitter for an event with a single parameter passed to the listeners.
 * @partial
 */
export interface IEventEmitterOfT<T> {
    /**
     * Registers to the event with the given handler
     * @param value The function to call when the event occurs.
     * @returns A function which can be called to unregister the registered handler.
     * This is usedful if the original function passed to this is not stored somewhere but
     * unregistering of the event needs to be done.
     */
    on(value: (arg: T) => void): () => void;
    /**
     * Unregisters the given handler from this event.
     * @param value The value originally passed into {@link on}, NOT the function returned by it.
     */
    off(value: (arg: T) => void): void;
}

export class EventEmitter implements IEventEmitter {
    private _listeners: (() => void)[] = [];
    private readonly _fireOnRegister: (() => boolean) | undefined;

    public constructor(fireOnRegister: (() => boolean) | undefined = undefined) {
        this._fireOnRegister = fireOnRegister;
    }

    public on(value: () => void): () => void {
        this._listeners.push(value);
        if (this._fireOnRegister?.()) {
            value();
        }
        return () => {
            this.off(value);
        };
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
    private readonly _fireOnRegister: (() => T | null) | undefined;

    public constructor(fireOnRegister: (() => T | null) | undefined = undefined) {
        this._fireOnRegister = fireOnRegister;
    }
    public on(value: (arg: T) => void): () => void {
        this._listeners.push(value);
        if (this._fireOnRegister) {
            const arg = this._fireOnRegister();
            if (arg !== null) {
                value(arg);
            }
        }
        return () => {
            this.off(value);
        };
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
