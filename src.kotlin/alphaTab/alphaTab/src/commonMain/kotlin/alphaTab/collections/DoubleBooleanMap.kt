package alphaTab.collections

internal open class DoubleBooleanMapEntry {
    private var _key: Double = 0.0
    public var key: Double
        get() = _key
        internal set(value) {
            _key = value
        }

    private var _value: Boolean = false
    public var value: Boolean
        get() = _value
        internal set(value) {
            _value = value
        }
}

internal class DoubleBooleanMapEntryInternal : DoubleBooleanMapEntry(), IMapEntryInternal {
    public override var hashCode: Int = 0
    public override var next: Int = 0

    override fun reset() {
        key = 0.0
        value = false
    }
}

internal class DoubleBooleanMap : MapBase<DoubleBooleanMapEntry, DoubleBooleanMapEntryInternal>() {
    public fun has(key: Double): Boolean {
        return findEntryInternal(key,
            { entry, k -> entry.key == k }) >= 0
    }

    public fun get(key: Double): Boolean {
        val i = findEntryInternal(key,
            { entry, k -> entry.key == k })
        if (i >= 0) {
            return entries[i].value
        }
        throw KeyNotFoundException()
    }

    public fun set(key: Double, value: Boolean) {
        insert(key, value)
    }

    private fun insert(key: Double, value: Boolean) {
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
    public fun values(): IBooleanIterable {
        _values = _values ?: ValueCollection(this)
        return _values!!
    }

    private var _keys: KeyCollection? = null
    public fun keys(): IDoubleIterable {
        _keys = _keys ?: KeyCollection(this)
        return _keys!!
    }

    override fun createEntries(size: Int): Array<DoubleBooleanMapEntryInternal> {
        return Array(size) {
            DoubleBooleanMapEntryInternal()
        }
    }

    override fun createEntries(
        size: Int,
        old: Array<DoubleBooleanMapEntryInternal>
    ): Array<DoubleBooleanMapEntryInternal> {
        return Array(size) {
            if (it < old.size) old[it] else DoubleBooleanMapEntryInternal()
        }
    }

    private class ValueCollection(private val map: DoubleBooleanMap) : IBooleanIterable {
        override fun iterator(): BooleanIterator {
            return ValueIterator(map.iterator())
        }

        private class ValueIterator(private val iterator: Iterator<DoubleBooleanMapEntry>) :
            BooleanIterator() {
            override fun hasNext(): Boolean {
                return iterator.hasNext()
            }

            override fun nextBoolean(): Boolean {
                return iterator.next().value
            }
        }
    }

    private class KeyCollection(private val map: DoubleBooleanMap) : IDoubleIterable {
        override fun iterator(): DoubleIterator {
            return KeyIterator(map.iterator())
        }

        private class KeyIterator(private val iterator: Iterator<DoubleBooleanMapEntry>) :
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
