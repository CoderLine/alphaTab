package alphaTab.core.ecmaScript

import kotlin.collections.Map

class Map<TKey, TValue> : Iterable<Map.Entry<TKey, TValue>> {
    private val _map: LinkedHashMap <TKey, TValue>

    public val size: Double
        get() {
            return _map.size.toDouble()
        }

    public constructor() {
        _map = LinkedHashMap(6)
    }

    public fun keys(): Iterable<TKey> {
        return _map.keys
    }

    public fun values(): Iterable<TValue> {
        return _map.values
    }

    public constructor(entries: Iterable<Pair<TKey, TValue>>) {
        _map = LinkedHashMap ()
        _map.putAll(entries)
    }

    public fun get(key: TKey): TValue? {
        return _map[key]
    }

    public fun set(key: TKey, value: TValue) {
        _map[key] = value
    }

    public fun has(key: TKey): Boolean {
        return _map.containsKey(key)
    }

    public fun delete(key: TKey) {
        _map.remove(key)
    }

    public fun clear() {
        _map.clear()
    }

    override fun iterator(): Iterator<Map.Entry<TKey, TValue>> {
        return _map.iterator()
    }
}
