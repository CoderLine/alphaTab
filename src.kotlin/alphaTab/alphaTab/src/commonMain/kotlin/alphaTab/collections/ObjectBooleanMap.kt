package alphaTab.collections

public open class ObjectBooleanMapEntry<TKey> {
    private var _key: TKey
    public var key: TKey
        get() = _key
        internal set(value) {
            _key = value
        }

    private var _value: Boolean
    public var value: Boolean
        get() = _value
        internal set(value) {
            _value = value
        }


    @Suppress("UNCHECKED_CAST")
    public constructor() {
        _key = null as TKey
        _value = false
    }

    public operator fun component1(): TKey {
        return _key
    }

    public operator fun component2(): Boolean {
        return _value
    }

    public constructor(key: TKey, value: Boolean) {
        _key = key
        _value = value
    }
}

public class ObjectBooleanMapEntryInternal<TKey> : ObjectBooleanMapEntry<TKey>(),
    IMapEntryInternal {
    public override var hashCode: Int = 0
    public override var next: Int = 0

    @Suppress("UNCHECKED_CAST")
    override fun reset() {
        key = null as TKey
        value = false
    }
}

public class ObjectBooleanMap<TKey> :
    MapBase<ObjectBooleanMapEntry<TKey>, ObjectBooleanMapEntryInternal<TKey>> {
    public constructor()
    public constructor(iterable: Iterable<ObjectBooleanMapEntry<TKey>>) {
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
    public fun get(key: TKey): Boolean {
        val i = findEntryInternal(key as Any,
            { entry, k -> entry.key == (k as TKey) })
        if (i >= 0) {
            return entries[i].value
        }
        throw KeyNotFoundException()
    }

    public fun set(key: TKey, value: Boolean) {
        insert(key, value)
    }

    @Suppress("UNCHECKED_CAST")
    private fun insert(key: TKey, value: Boolean) {
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
    public fun values(): IBooleanIterable {
        _values = _values ?: ValueCollection(this)
        return _values!!
    }

    private var _keys: KeyCollection<TKey>? = null
    public fun keys(): Iterable<TKey> {
        _keys = _keys ?: KeyCollection(this)
        return _keys!!
    }

    override fun createEntries(size: Int): Array<ObjectBooleanMapEntryInternal<TKey>> {
        return Array(size) {
            ObjectBooleanMapEntryInternal()
        }
    }

    override fun createEntries(
        size: Int,
        old: Array<ObjectBooleanMapEntryInternal<TKey>>
    ): Array<ObjectBooleanMapEntryInternal<TKey>> {
        return Array(size) {
            if (it < old.size) old[it] else ObjectBooleanMapEntryInternal()
        }
    }

    private class ValueCollection<TKey>(private val map: ObjectBooleanMap<TKey>) :
        IBooleanIterable {
        override fun iterator(): BooleanIterator {
            return ValueIterator(map.iterator())
        }

        private class ValueIterator<TKey>(private val iterator: Iterator<ObjectBooleanMapEntry<TKey>>) :
            BooleanIterator() {
            override fun hasNext(): Boolean {
                return iterator.hasNext()
            }

            override fun nextBoolean(): Boolean {
                return iterator.next().value
            }
        }
    }


    private class KeyCollection<TKey>(private val map: ObjectBooleanMap<TKey>) : Iterable<TKey> {
        override fun iterator(): Iterator<TKey> {
            return KeyIterator(map.iterator())
        }

        private class KeyIterator<TKey>(private val iterator: Iterator<ObjectBooleanMapEntry<TKey>>) : Iterator<TKey> {
            override fun hasNext(): Boolean {
                return iterator.hasNext()
            }

            override fun next(): TKey {
                return iterator.next().key
            }
        }
    }
}
