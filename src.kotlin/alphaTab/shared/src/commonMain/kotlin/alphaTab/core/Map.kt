package alphaTab.core

public interface IMap<TKey, TValue> : Iterable<Pair<TKey, TValue>> {
    val size: Double
    fun has(key: TKey): Boolean
    fun get(key: TKey): TValue?
    fun set(key: TKey, value: TValue)
    fun delete(key: TKey)
    fun values(): Iterable<TValue>
    fun keys(): Iterable<TKey>
    fun clear()
}

public class Map<TKey, TValue> : IMap<TKey, TValue> {
    private val _data: LinkedHashMap<TKey, TValue>

    public constructor() {
        _data = LinkedHashMap()
    }

    public constructor(entries: Iterable<Pair<TKey, TValue>>) {
        _data = LinkedHashMap()
        _data.putAll(entries)
    }

    override val size: Double
        get() = _data.size.toDouble()

    override fun has(key: TKey): Boolean {
        return _data.containsKey(key)
    }

    override fun get(key: TKey): TValue? {
        return _data[key]
    }

    override fun set(key: TKey, value: TValue) {
        _data[key] = value
    }

    override fun delete(key: TKey) {
        _data.remove(key)
    }

    override fun values(): Iterable<TValue> {
        return _data.values
    }

    override fun keys(): Iterable<TKey> {
        return _data.keys
    }

    override fun clear() {
        _data.clear()
    }

    override fun iterator(): Iterator<Pair<TKey, TValue>> {
        return _data.map { Pair(it.key, it.value) }.iterator()
    }
}
