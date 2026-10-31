type Plain = Record<string, unknown>;

function isPlain(value: unknown): value is Plain {
    if (value === null || typeof value !== 'object') {
        return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function definedKeys(value: Plain): string[] {
    return Object.keys(value).filter(key => value[key] !== undefined);
}

/**
 * Structural equality as alphaTab's settings see it: plain objects by their defined keys in any order,
 * arrays by elements, `Map`s by entries, everything else (DOM nodes, class instances, functions) by
 * identity. Pairs already under comparison count as equal, so cycles terminate.
 * @internal
 */
export function settingsEqual(a: unknown, b: unknown, visiting = new Map<object, Set<object>>()): boolean {
    if (Object.is(a, b)) {
        return true;
    }
    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
        return false;
    }
    let partners = visiting.get(a);
    if (partners?.has(b)) {
        return true;
    }
    if (!partners) {
        partners = new Set();
        visiting.set(a, partners);
    }
    partners.add(b);

    if (Array.isArray(a) || Array.isArray(b)) {
        return (
            Array.isArray(a) &&
            Array.isArray(b) &&
            a.length === b.length &&
            a.every((item, i) => settingsEqual(item, b[i], visiting))
        );
    }
    if (a instanceof Map || b instanceof Map) {
        if (!(a instanceof Map) || !(b instanceof Map) || a.size !== b.size) {
            return false;
        }
        for (const [key, value] of a) {
            if (!b.has(key) || !settingsEqual(value, b.get(key), visiting)) {
                return false;
            }
        }
        return true;
    }
    if (isPlain(a) && isPlain(b)) {
        const keys = definedKeys(a);
        const otherKeys = new Set(definedKeys(b));
        if (keys.length !== otherKeys.size) {
            return false;
        }
        return keys.every(key => otherKeys.has(key) && settingsEqual(a[key], b[key], visiting));
    }
    return false;
}

function diffPlain(previous: Plain | undefined, next: Plain, visiting: Set<object>): Plain | undefined {
    if (visiting.has(next)) {
        return undefined;
    }
    visiting.add(next);
    const previousKeys = new Set(previous ? definedKeys(previous) : []);
    let changed: Plain | undefined;
    for (const key of definedKeys(next)) {
        const value = next[key];
        const old = previousKeys.has(key) ? previous![key] : undefined;
        let patch: unknown;
        if (isPlain(value) && isPlain(old)) {
            patch = diffPlain(old, value, visiting);
            if (patch === undefined) {
                continue;
            }
        } else if (settingsEqual(old, value)) {
            continue;
        } else {
            patch = value;
        }
        changed ??= {};
        changed[key] = patch;
    }
    visiting.delete(next);
    return changed;
}

/**
 * The parts of the settings patch `next` that differ from `previous`, for `settings.fillFromJson`.
 * Plain objects are descended into, so the result holds only the changed leaves; arrays, `Map`s and
 * other values are taken whole when they differ, as alphaTab replaces them whole. Keys missing from
 * `next` or set to `undefined` are not part of the result. `undefined` when nothing changed.
 * @internal
 */
export function diffSettings(previous: unknown, next: unknown): Plain | undefined {
    if (!isPlain(next)) {
        return undefined;
    }
    return diffPlain(isPlain(previous) ? previous : undefined, next, new Set());
}

/**
 * A copy of `value` that later mutations of the original's plain objects, arrays and `Map`s do not
 * reach; other objects are kept by reference. Shared and cyclic references are preserved.
 * @internal
 */
export function snapshotSettings<T>(value: T, copies = new Map<object, unknown>()): T {
    if (value === null || typeof value !== 'object') {
        return value;
    }
    const existing = copies.get(value);
    if (existing !== undefined) {
        return existing as T;
    }
    if (Array.isArray(value)) {
        const copy: unknown[] = [];
        copies.set(value, copy);
        for (const item of value) {
            copy.push(snapshotSettings(item, copies));
        }
        return copy as T;
    }
    if (value instanceof Map) {
        const copy = new Map<unknown, unknown>();
        copies.set(value, copy);
        for (const [key, item] of value) {
            copy.set(key, snapshotSettings(item, copies));
        }
        return copy as T;
    }
    if (isPlain(value)) {
        const copy: Plain = {};
        copies.set(value, copy);
        for (const key of Object.keys(value)) {
            copy[key] = snapshotSettings(value[key], copies);
        }
        return copy as T;
    }
    return value;
}
