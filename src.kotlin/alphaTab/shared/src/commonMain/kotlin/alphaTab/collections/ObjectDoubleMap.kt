package alphaTab.collections

public open class ObjectDoubleMapEntry<TKey> {
    private var _key: TKey
    public var key: TKey
        get() = _key
        internal set(value) {
            _key = value
        }

    private var _value: Double
    public var value: Double
        get() = _value
        internal set(value) {
            _value = value
        }

    @Suppress("UNCHECKED_CAST")
    public constructor() {
        _key = null as TKey
        _value = 0.0
    }

    public constructor(key: TKey, value: Double) {
        _key = key
        _value = value
    }
}

public class ObjectDoubleMapEntryInternal<TKey> : ObjectDoubleMapEntry<TKey>(),
    IMapEntryInternal {
    public override var hashCode: Int = 0
    public override var next: Int = 0

    @Suppress("UNCHECKED_CAST")
    override fun reset() {
        key = null as TKey
        value = 0.0
    }
}

public class ObjectDoubleMap<TKey> :
    MapBase<ObjectDoubleMapEntry<TKey>, ObjectDoubleMapEntryInternal<TKey>> {
    public constructor()
    public constructor(iterable: Iterable<ObjectDoubleMapEntry<TKey>>) {
        for (it in iterable) {
            set(it.key, it.value)
        }
    }

    @Suppress("UNCHECKED_CAST")
    public fun has(key: TKey): Boolean {
        return findEntryInternal(key as Any,
            { entry, k -> entry.key == (k as TKey) }) >= 0
    }

    @Suppress("UNCHECKED_CAST")
    public fun get(key: TKey): Double {
        val i = findEntryInternal(key as Any,
            { entry, k -> entry.key == (k as TKey) })
        if (i >= 0) {
            return entries[i].value
        }
        throw KeyNotFoundException()
    }

    public fun set(key: TKey, value: Double) {
        insert(key, value)
    }

    @Suppress("UNCHECKED_CAST")
    private fun insert(key: TKey, value: Double) {
        insertInternal(
            key as Any, value,
            { entry, k -> entry.key = k as TKey },
            { entry, v -> entry.value = v },
            { entry, k -> entry.key == (k as TKey) }
        )
    }

    public fun delete(key: TKey) {
        deleteInternal(key.hashCode())
    }

    private var _values: ValueCollection<TKey>? = null
    public fun values(): IDoubleIterable {
        _values = _values ?: ValueCollection(this)
        return _values!!
    }

    private var _keys: KeyCollection<TKey>? = null
    public fun keys(): Iterable<TKey> {
        _keys = _keys ?: KeyCollection(this)
        return _keys!!
    }

    override fun createEntries(size: Int): Array<ObjectDoubleMapEntryInternal<TKey>> {
        return Array(size) {
            ObjectDoubleMapEntryInternal()
        }
    }

    override fun createEntries(
        size: Int,
        old: Array<ObjectDoubleMapEntryInternal<TKey>>
    ): Array<ObjectDoubleMapEntryInternal<TKey>> {
        return Array(size) {
            if (it < old.size) old[it] else ObjectDoubleMapEntryInternal()
        }
    }

    private class ValueCollection<TKey>(private val map: ObjectDoubleMap<TKey>) :
        IDoubleIterable {
        override fun iterator(): DoubleIterator {
            return ValueIterator(map.iterator())
        }

        private class ValueIterator<TKey>(private val iterator: Iterator<ObjectDoubleMapEntry<TKey>>) :
            DoubleIterator() {
            override fun hasNext(): Boolean {
                return iterator.hasNext()
            }

            override fun nextDouble(): Double {
                return iterator.next().value
            }
        }
    }


    private class KeyCollection<TKey>(private val map: ObjectDoubleMap<TKey>) : Iterable<TKey> {
        override fun iterator(): Iterator<TKey> {
            return KeyIterator(map.iterator())
        }

        private class KeyIterator<TKey>(private val iterator: Iterator<ObjectDoubleMapEntry<TKey>>) :
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
