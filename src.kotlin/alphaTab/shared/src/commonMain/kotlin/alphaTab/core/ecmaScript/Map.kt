package alphaTab.core.ecmaScript

import kotlin.collections.Map

class Map<TKey, TValue> : Iterable<Map.Entry<TKey, TValue>> {
    private val _map: HashMap <TKey, TValue>

    public val size: Double
        get() {
            return _map.size.toDouble()
        }

    public constructor() {
        _map = HashMap(6)
    }

    public fun keys(): MutableList<TKey> {
        return _map.keys.toMutableList()
    }

    public fun values(): MutableList<TValue> {
        return _map.values.toMutableList()
    }

    public constructor(entries: Iterable<Pair<TKey, TValue>>) {
        _map = HashMap ()
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
