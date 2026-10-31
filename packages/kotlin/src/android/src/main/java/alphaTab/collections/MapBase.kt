package alphaTab.collections

public interface IMapEntryInternal {
    public fun reset()
    public var hashCode: Int
    public var next: Int
}

/**
 * Key equality of JavaScript `Map` and `Set` (SameValueZero): `NaN` equals `NaN`.
 */
internal inline fun sameValueZero(a: Double, b: Double): Boolean {
    return a == b || (a.isNaN() && b.isNaN())
}

/**
 * Key equality of JavaScript `Map` and `Set` (SameValueZero) for boxed keys: `-0.0` equals `0.0`.
 */
internal fun sameValueZero(a: Any?, b: Any?): Boolean {
    return a == b || (a is Double && b is Double && a == 0.0 && b == 0.0)
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

internal inline fun
    <reified TEntryType, reified TInternalEntryType : IMapEntryInternal, reified TKey>
    MapBase<TEntryType, TInternalEntryType>.deleteInternal(
    key: TKey,
    keyEquals: (entry: TInternalEntryType, key: TKey) -> Boolean
) {
    val buckets = _buckets ?: return
    val entries = this.entries
    val hashCode = key.hashCode() and 0x7FFFFFFF
    val bucket = hashCode % buckets.size
    var last = -1
    var i = buckets[bucket]
    while (i >= 0) {
        val entry = entries[i]
        if (entry.hashCode == hashCode && keyEquals(entry, key)) {
            if (last < 0) {
                buckets[bucket] = entry.next
            } else {
                entries[last].next = entry.next
            }
            entry.hashCode = -1
            entry.next = _freeList
            entry.reset()
            _freeList = i
            _freeCount++
            return
        }

        last = i
        i = entry.next
    }
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

        override fun hasNext(): Boolean {
            while (_entryIndex < map._count && map.entries[_entryIndex].hashCode < 0) {
                _entryIndex++
            }
            return _entryIndex < map._count
        }

        @Suppress("UNCHECKED_CAST")
        override fun next(): TEntryType {
            if (!hasNext()) {
                throw NoSuchElementException("Map has no more elements")
            }
            return map.entries[_entryIndex++] as TEntryType
        }
    }


}
