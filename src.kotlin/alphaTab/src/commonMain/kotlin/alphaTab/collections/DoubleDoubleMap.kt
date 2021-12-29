package alphaTab.collections

public open class DoubleDoubleMapEntry {
    private var _key: Double = 0.0
    public var key: Double
        get() = _key
        internal set(value) {
            _key = value
        }

    private var _value: Double = 0.0
    public var value: Double
        get() = _value
        internal set(value) {
            _value = value
        }
}

public class DoubleDoubleMapEntryInternal : DoubleDoubleMapEntry(), IMapEntryInternal {
    public override var hashCode: Int = 0
    public override var next: Int = 0

    override fun reset() {
        key = 0.0
        value = 0.0
    }
}

public class DoubleDoubleMap : MapBase<DoubleDoubleMapEntry, DoubleDoubleMapEntryInternal>() {
    public fun has(key: Double): Boolean {
        return findEntryInternal(key,
            { entry, k -> entry.key == k }) >= 0
    }

    public fun get(key: Double): Double {
        val i = findEntryInternal(key,
            { entry, k -> entry.key == k })
        if (i >= 0) {
            return entries[i].value
        }
        throw KeyNotFoundException()
    }

    public fun set(key: Double, value: Double) {
        insert(key, value)
    }

    private fun insert(key: Double, value: Double) {
        insertInternal(key, value,
            { entry, k -> entry.key = k },
            { entry, v -> entry.value = v },
            { entry, k -> entry.key == k }
        )
    }

    public fun delete(key: Double) {
        deleteInternal(key.hashCode())
    }

    private var _values: ValueCollection? = null
    public fun values(): IDoubleIterable {
        _values = _values ?: ValueCollection(this)
        return _values!!
    }

    private var _keys: KeyCollection? = null
    public fun keys(): IDoubleIterable {
        _keys = _keys ?: KeyCollection(this)
        return _keys!!
    }


    override fun createEntries(size: Int): Array<DoubleDoubleMapEntryInternal> {
        return Array(size) {
            DoubleDoubleMapEntryInternal()
        }
    }

    override fun createEntries(
        size: Int,
        old: Array<DoubleDoubleMapEntryInternal>
    ): Array<DoubleDoubleMapEntryInternal> {
        return Array(size) {
            if (it < old.size) old[it] else DoubleDoubleMapEntryInternal()
        }
    }

    private class ValueCollection(private val map: DoubleDoubleMap) : IDoubleIterable {
        override fun iterator(): DoubleIterator {
            return ValueIterator(map.iterator())
        }

        private class ValueIterator(private val iterator: Iterator<DoubleDoubleMapEntry>) :
            DoubleIterator() {
            override fun hasNext(): Boolean {
                return iterator.hasNext()
            }

            override fun nextDouble(): Double {
                return iterator.next().value
            }
        }
    }

    private class KeyCollection(private val map: DoubleDoubleMap) : IDoubleIterable {
        override fun iterator(): DoubleIterator {
            return KeyIterator(map.iterator())
        }

        private class KeyIterator(private val iterator: Iterator<DoubleDoubleMapEntry>) :
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
