package alphaTab.collections

public open class MapEntry<TKey, TValue> {
    private var _key: TKey
    public var key: TKey
        get() = _key
        internal set(value) {
            _key = value
        }

    private var _value: TValue
    public var value: TValue
        get() = _value
        internal set(value) {
            _value = value
        }

    public operator fun component1(): TKey {
        return _key
    }

    public operator fun component2(): TValue {
        return _value
    }

    @Suppress("UNCHECKED_CAST")
    public constructor() {
        _key = null as TKey
        _value = null as TValue
    }

    public constructor(key: TKey, value: TValue) {
        _key = key
        _value = value
    }
}


public class MapEntryInternal<TKey, TValue> : MapEntry<TKey, TValue>(),
    IMapEntryInternal {
    public override var hashCode: Int = 0
    public override var next: Int = 0

    @Suppress("UNCHECKED_CAST")
    override fun reset() {
        key = null as TKey
        value = null as TValue
    }
}

public class Map<TKey, TValue>:
    MapBase<MapEntry<TKey, TValue>, MapEntryInternal<TKey, TValue>> {
    public constructor()
    public constructor(iterable: Iterable<MapEntry<TKey, TValue>>) {
        for (it in iterable) {
            set(it.key, it.value)
        }
    }

    @Suppress("UNCHECKED_CAST")
    public fun has(key: TKey): Boolean {
        return findEntryInternal(key as Any?,
            { entry, k -> entry.key == (k as TKey) }) >= 0
    }

    @Suppress("UNCHECKED_CAST")
    public fun get(key: TKey): TValue {
        val i = findEntryInternal(key as Any?,
            { entry, k -> entry.key == (k as TKey) })
        if (i >= 0) {
            return entries[i].value
        }
        throw KeyNotFoundException()
    }

    public fun set(key: TKey, value: TValue) {
        insert(key, value)
    }

    @Suppress("UNCHECKED_CAST")
    private fun insert(key: TKey, value: TValue) {
        insertInternal(
            key as Any?, value as Any?,
            { entry, k -> entry.key = k as TKey },
            { entry, v -> entry.value = v as TValue },
            { entry, k -> entry.key == (k as TKey) }
        )
    }

    public fun delete(key: TKey) {
        deleteInternal(key.hashCode())
    }

    private var _values: ValueCollection<TKey, TValue>? = null
    public fun values(): Iterable<TValue> {
        _values = _values ?: ValueCollection(this)
        return _values!!
    }

    private var _keys: KeyCollection<TKey, TValue>? = null
    public fun keys(): Iterable<TKey> {
        _keys = _keys ?: KeyCollection(this)
        return _keys!!
    }

    override fun createEntries(size: Int): Array<MapEntryInternal<TKey, TValue>> {
        return Array(size) {
            MapEntryInternal()
        }
    }

    override fun createEntries(
        size: Int,
        old: Array<MapEntryInternal<TKey, TValue>>
    ): Array<MapEntryInternal<TKey, TValue>> {
        return Array(size) {
            if (it < old.size) old[it] else MapEntryInternal()
        }
    }

    private class ValueCollection<TKey, TValue>(private val map: Map<TKey, TValue>) :
        Iterable<TValue> {
        override fun iterator(): Iterator<TValue> {
            return ValueIterator(map.iterator())
        }

        private class ValueIterator<TKey, TValue>(private val iterator: Iterator<MapEntry<TKey, TValue>>) :
            Iterator<TValue> {
            override fun hasNext(): Boolean {
                return iterator.hasNext()
            }

            override fun next(): TValue {
                return iterator.next().value
            }
        }
    }


    private class KeyCollection<TKey, TValue>(private val map: Map<TKey, TValue>) : Iterable<TKey> {
        override fun iterator(): Iterator<TKey> {
            return KeyIterator(map.iterator())
        }

        private class KeyIterator<TKey, TValue>(private val iterator: Iterator<MapEntry<TKey, TValue>>) :
            Iterator<TKey> {
            override fun hasNext(): Boolean {
                return iterator.hasNext()
            }

            override fun next(): TKey {
                return iterator.next().key
            }
        }
    }
}
