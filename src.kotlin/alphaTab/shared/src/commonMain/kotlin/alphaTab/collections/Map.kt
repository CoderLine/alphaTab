package alphaTab.collections

public data class MapEntry<TKey, TValue>(
    public val key:TKey,
    public val value:TValue
)

public class Map<TKey, TValue> {
    private val _data: LinkedHashMap<TKey, TValue>
    
    public constructor() {
        _data = LinkedHashMap()
    }

    public constructor(entries: Iterable<MapEntry<TKey, TValue>>) {
        _data = LinkedHashMap()
        _data.putAll(entries.map { Pair(it.key, it.value) })
    }

    public val size: Double
        get() = _data.size.toDouble()

    public fun has(key: TKey): Boolean {
        return _data.containsKey(key)
    }

    public fun get(key: TKey): TValue {
        @Suppress("UNCHECKED_CAST")
        return _data[key] as TValue
    }

    public fun set(key: TKey, value: TValue) {
        _data[key] = value
    }

    public fun delete(key: TKey) {
        _data.remove(key)
    }

    public fun values(): Iterable<TValue> {
        return _data.values
    }

    public fun keys(): Iterable<TKey> {
        return _data.keys
    }

    public fun clear() {
        _data.clear()
    }

    public operator fun iterator(): Iterator<MapEntry<TKey, TValue>> {
        return _data.map { MapEntry(it.key, it.value) }.iterator()
    }
}
