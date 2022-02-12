package alphaTab.collections

public interface IMapEntryInternal {
    public fun reset()
    public var hashCode: Int
    public var next: Int
}

internal inline fun
    <reified TEntryType, reified TInternalEntryType : IMapEntryInternal, reified TKey>
    MapBase<TEntryType, TInternalEntryType>.findEntryInternal(
    key: TKey,
    keyEquals: (entry: TInternalEntryType, key: TKey) -> Boolean
): Int {
    val buckets = _buckets
    val entries = this.entries
    if (buckets != null) {
        val hashCode = key.hashCode() and 0x7FFFFFFF
        var i = buckets[hashCode % buckets.size]
        while (i >= 0) {
            if (entries[i].hashCode == hashCode && keyEquals(entries[i], key)) {
                return i
            }

            i = entries[i].next
        }
    }
    return -1
}

internal inline fun
    <reified TEntryType, reified TInternalEntryType : IMapEntryInternal, reified TKey, reified TValue>
    MapBase<TEntryType, TInternalEntryType>.insertInternal(
    key: TKey,
    value: TValue,
    setKey: (entry: TInternalEntryType, key: TKey) -> Unit,
    setValue: (entry: TInternalEntryType, value: TValue) -> Unit,
    keyEquals: (entry: TInternalEntryType, key: TKey) -> Boolean
) {
    var buckets = _buckets
    if (buckets == null) {
        buckets = initialize(0)
    }

    val hashCode = key.hashCode() and 0x7FFFFFFF
    var targetBucket = hashCode % buckets.size

    var i = buckets[targetBucket]
    while (i >= 0) {
        if (entries[i].hashCode == hashCode && keyEquals(entries[i], key)) {
            setValue(entries[i], value)
            return
        }

        i = entries[i].next
    }

    val index: Int
    if (_freeCount > 0) {
        index = _freeList
        _freeList = entries[index].next
        _freeCount--
    } else {
        if (_count == entries.size) {
            buckets = resize()
            targetBucket = hashCode % buckets.size
        }
        index = _count
        _count++
    }

    val entry = entries[index]
    entry.hashCode = hashCode
    entry.next = buckets[targetBucket]
    setKey(entry, key)
    setValue(entry, value)
    buckets[targetBucket] = index
}


public abstract class MapBase<TEntryType, TInternalEntryType : IMapEntryInternal> :
    Iterable<TEntryType> {
    internal var _count: Int = 0
    internal var _freeCount: Int = 0
    internal var _buckets: IntArray? = null
    internal var _freeList: Int = 0

    internal var entries: Array<TInternalEntryType> = createEntries(0)
    internal fun initialize(capacity: Int): IntArray {
        val size = HashHelpers.getPrime(capacity)
        _buckets = IntArray(size) {
            -1
        }
        entries = createEntries(size)
        _freeList = -1
        return _buckets!!
    }

    internal abstract fun createEntries(size: Int): Array<TInternalEntryType>
    internal abstract fun createEntries(
        size: Int,
        old: Array<TInternalEntryType>
    ): Array<TInternalEntryType>

    public val size: Double
        get() = (_count - _freeCount).toDouble()

    internal fun resize(): IntArray {
        return resize(HashHelpers.expandPrime(_count))
    }

    private fun resize(newSize: Int): IntArray {
        val newBuckets = IntArray(newSize) {
            -1
        }
        val newEntries = createEntries(newSize, entries)
        var i = 0
        while (i < _count) {
            if (newEntries[i].hashCode >= 0) {
                val bucket = newEntries[i].hashCode % newSize
                newEntries[i].next = newBuckets[bucket]
                newBuckets[bucket] = i
            }
            i++
        }
        _buckets = newBuckets
        entries = newEntries
        return newBuckets
    }

    protected fun deleteInternal(keyHashCode: Int) {
        val buckets = _buckets
        if (buckets != null) {
            val hashCode = keyHashCode and 0x7FFFFFFF
            val bucket = hashCode % buckets.size
            var last = -1
            var i = buckets[bucket]
            while (i >= 0) {
                if (entries[i].hashCode == hashCode) {
                    if (last < 0) {
                        buckets[bucket] = entries[i].next
                    } else {
                        entries[last].next = entries[i].next
                    }
                    entries[i].hashCode = -1
                    entries[i].next = _freeList
                    entries[i].reset()
                    _freeList = i
                    _freeCount++
                    return
                }

                last = i
                i = entries[i].next
            }
        }
    }

    public fun clear() {
        if (_count > 0) {
            _buckets?.fill(-1)
            entries = createEntries(0)
            _freeList = -1
            _count = 0
            _freeCount = 0
        }
    }

    override fun iterator(): Iterator<TEntryType> {
        return MapIterator(this)
    }

    private class MapIterator<TEntryType, TInternalEntryType : IMapEntryInternal>
        (private val map: MapBase<TEntryType, TInternalEntryType>) : Iterator<TEntryType> {
        private var _entryIndex = 0
        private var _index = 0

        override fun hasNext(): Boolean {
            return _index < map.size
        }

        @Suppress("UNCHECKED_CAST")
        override fun next(): TEntryType {
            while (_entryIndex < map._count) {
                if (map.entries[_entryIndex].hashCode >= 0) {
                    val currentValue = map.entries[_entryIndex] as TEntryType
                    _entryIndex++
                    _index++
                    return currentValue
                }
                _entryIndex++
            }
            throw NoSuchElementException("Map has no more elements")
        }
    }


}
