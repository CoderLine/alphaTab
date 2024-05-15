package alphaTab.collections

public open class DoubleObjectMapEntry<TValue> {
    private var _key: Double
    public var key: Double
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

    public operator fun component1(): Double {
        return _key
    }

    public operator fun component2(): TValue {
        return _value
    }

    @Suppress("UNCHECKED_CAST")
    public constructor() {
        _key = 0.0
        _value = null as TValue
    }

    public constructor(key: Double, value: TValue) {
        _key = key
        _value = value
    }
}

public class DoubleObjectMapEntryInternal<TValue> : DoubleObjectMapEntry<TValue>(),
    IMapEntryInternal {
    public override var hashCode: Int = 0
    public override var next: Int = 0

    @Suppress("UNCHECKED_CAST")
    override fun reset() {
        key = 0.0
        value = null as TValue
    }
}

public class DoubleObjectMap<TValue> :
    MapBase<DoubleObjectMapEntry<TValue>, DoubleObjectMapEntryInternal<TValue>> {
    public constructor()
    public constructor(iterable: Iterable<DoubleObjectMapEntry<TValue>>) {
        for (it in iterable) {
            set(it.key, it.value)
        }
    }

    public fun has(key: Double): Boolean {
        return findEntryInternal(key,
            { entry, k -> entry.key == k }) >= 0
    }

    public fun get(key: Double): TValue {
        val i = findEntryInternal(key,
            { entry, k -> entry.key == k })
        if (i >= 0) {
            return entries[i].value
        }
        throw KeyNotFoundException()
    }

    public fun set(key: Double, value: TValue) {
        insert(key, value)
    }

    @Suppress("UNCHECKED_CAST")
    private fun insert(key: Double, value: TValue) {
        insertInternal(
            key, value as Any,
            { entry, k -> entry.key = k },
            { entry, v -> entry.value = v as TValue },
            { entry, k -> entry.key == k }
        )
    }

    public fun delete(key: Double) {
        deleteInternal(key.hashCode())
    }

    private var _values: ValueCollection<TValue>? = null
    public fun values(): Iterable<TValue> {
        _values = _values ?: ValueCollection(this)
        return _values!!
    }

    private var _keys: KeyCollection<TValue>? = null
    public fun keys(): IDoubleIterable {
        _keys = _keys ?: KeyCollection(this)
        return _keys!!
    }

    override fun createEntries(size: Int): Array<DoubleObjectMapEntryInternal<TValue>> {
        return Array(size) {
            DoubleObjectMapEntryInternal()
        }
    }

    override fun createEntries(
        size: Int,
        old: Array<DoubleObjectMapEntryInternal<TValue>>
    ): Array<DoubleObjectMapEntryInternal<TValue>> {
        return Array(size) {
            if (it < old.size) old[it] else DoubleObjectMapEntryInternal()
        }
    }


    private class ValueCollection<TValue>(private val map: DoubleObjectMap<TValue>) :
        Iterable<TValue> {
        override fun iterator(): Iterator<TValue> {
            return ValueIterator(map.iterator())
        }

        private class ValueIterator<TValue>(private val iterator: Iterator<DoubleObjectMapEntry<TValue>>) :
            Iterator<TValue> {
            override fun hasNext(): Boolean {
                return iterator.hasNext()
            }

            override fun next(): TValue {
                return iterator.next().value
            }
        }
    }

    private class KeyCollection<TValue>(private val map: DoubleObjectMap<TValue>) :
        IDoubleIterable {
        override fun iterator(): DoubleIterator {
            return ValueIterator(map.iterator())
        }

        private class ValueIterator<TValue>(private val iterator: Iterator<DoubleObjectMapEntry<TValue>>) :
            DoubleIterator() {
            override fun hasNext(): Boolean {
                return iterator.hasNext()
            }

            override fun nextDouble(): Double {
                return iterator.next().key
            }
        }
    }
}
