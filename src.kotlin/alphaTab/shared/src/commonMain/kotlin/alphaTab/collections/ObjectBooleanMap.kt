package alphaTab.collections

public open class ObjectBooleanMapEntry<TKey> {
    private val _key: TKey
    public open val key: TKey
        get() = _key

    private val _value: Boolean
    public open val value: Boolean
        get() = _value

    public constructor() {
        _key = null as TKey
        _value = false
    }

    public constructor(key: TKey, value: Boolean) {
        _key = key
        _value = value
    }
}

internal class ObjectBooleanMapEntryInternal<TKey> : ObjectBooleanMapEntry<TKey>() {
    public var hashCode: Int = 0
    public var next: Int = 0
    public override var key: TKey = null as TKey
    public override var value: Boolean = false
}

public class ObjectBooleanMap<TKey> : Iterable<ObjectBooleanMapEntry<TKey>> {
    private var _count: Int = 0
    private var _freeCount: Int = 0
    private var _buckets: IntArray? = null
    private var _entries: Array<ObjectBooleanMapEntryInternal<TKey>> = arrayOf()
    private var _freeList: Int = 0

    public constructor()
    public constructor(iterable: Iterable<ObjectBooleanMapEntry<TKey>>) {
        for (it in iterable) {
            set(it.key, it.value)
        }
    }

    public val size: Double
        get() = (_count - _freeCount).toDouble()

    public fun has(key: TKey): Boolean {
        return findEntry(key) >= 0
    }

    private fun findEntry(key: TKey): Int {
        val buckets = _buckets
        if (buckets != null) {
            val hashCode = key.hashCode() and 0x7FFFFFFF
            var i = buckets[hashCode % buckets.size]
            while (i >= 0) {
                if (_entries[i].hashCode == hashCode) {
                    return i
                }

                i = _entries[i].next
            }
        }
        return -1
    }

    public fun get(key: TKey): Boolean {
        val i = findEntry(key)
        if (i >= 0) return _entries[i].value
        throw KeyNotFoundException()
    }

    public fun set(key: TKey, value: Boolean) {
        insert(key, value)
    }

    private fun insert(key: TKey, value: Boolean) {
        var buckets = _buckets
        if (buckets == null) {
            buckets = initialize(0)
        }

        val hashCode = key.hashCode() and 0x7FFFFFFF
        var targetBucket = hashCode % buckets.size

        var i = buckets[targetBucket]
        while (i >= 0) {
            if (_entries[i].hashCode == hashCode) {
                _entries[i].value = value
                return
            }

            i = _entries[i].next
        }

        val index: Int
        if (_freeCount > 0) {
            index = _freeList
            _freeList = _entries[index].next
            _freeCount--
        } else {
            if (_count == _entries.size) {
                buckets = resize()
                targetBucket = hashCode and buckets.size
            }
            index = _count
            _count++
        }

        val entry = _entries[index]
        entry.hashCode = hashCode
        entry.next = buckets[targetBucket]
        entry.key = key
        entry.value = value
        buckets[targetBucket] = index
    }

    private fun resize(): IntArray {
        return resize(HashHelpers.expandPrime(_count), false)
    }

    private fun resize(newSize: Int, forceNewHashCodes: Boolean): IntArray {
        val newBuckets = IntArray(newSize) {
            -1
        }
        val newEntries = Array(newSize) {
            ObjectBooleanMapEntryInternal<TKey>()
        }
        _entries.copyInto(newEntries, 0, 0, _count)

        if (forceNewHashCodes) {
            for (i in 0 until _count) {
                if (newEntries[i].hashCode != -1) {
                    newEntries[i].hashCode = newEntries[i].key.hashCode() and 0x7FFFFFFF
                }
            }
        }
        for (i in 0 until _count) {
            if (newEntries[i].hashCode >= 0) {
                val bucket = newEntries[i].hashCode % newSize
                newEntries[i].next = newBuckets[bucket]
                newBuckets[bucket] = i
            }
        }
        _buckets = newBuckets
        _entries = newEntries
        return newBuckets
    }


    private fun initialize(capacity: Int): IntArray {
        val size = HashHelpers.getPrime(capacity)
        _buckets = IntArray(size) {
            -1
        }
        _entries = Array(size) {
            ObjectBooleanMapEntryInternal()
        }
        _freeList = -1
        return _buckets!!
    }

    public fun delete(key: TKey) {
        val buckets = _buckets
        if (buckets != null) {
            val hashCode = key.hashCode() and 0x7FFFFFFF
            val bucket = hashCode % buckets.size
            var last = -1
            var i = buckets[bucket]
            while (i >= 0) {
                if (_entries[i].hashCode == hashCode) {
                    if (last < 0) {
                        buckets[bucket] = _entries[i].next
                    } else {
                        _entries[last].next = _entries[i].next
                    }
                    _entries[i].hashCode = -1
                    _entries[i].next = _freeList
                    _entries[i].key = null as TKey
                    _entries[i].value = false
                    _freeList = i
                    _freeCount++
                    return
                }


                last = i
                i = _entries[i].next
            }
        }
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

    public fun clear() {
        if (_count > 0) {
            _buckets?.fill(-1)
            _entries.fill(ObjectBooleanMapEntryInternal())
            _freeList = -1
            _count = 0
            _freeCount = 0
        }
    }

    override fun iterator(): Iterator<ObjectBooleanMapEntry<TKey>> {
        return MapIterator(this)
    }

    private class MapIterator<TKey>(private val map: ObjectBooleanMap<TKey>) :
        Iterator<ObjectBooleanMapEntry<TKey>> {
        private var _index = 0
        private var _currentValue: ObjectBooleanMapEntry<TKey>? = null

        override fun hasNext(): Boolean {
            while (_index < map._count) {
                if (map._entries[_index].hashCode >= 0) {
                    _currentValue = map._entries[_index]
                    _index++
                    return true
                }
            }
            _index = map._count + 1
            _currentValue = null
            return false
        }

        override fun next(): ObjectBooleanMapEntry<TKey> {
            return _currentValue!!
        }
    }

    private class ValueCollection<TKey>(private val map: ObjectBooleanMap<TKey>) :
        IBooleanIterable {
        override fun iterator(): BooleanIterator {
            return ValueIterator(map)
        }

        private class ValueIterator<TKey>(private val map: ObjectBooleanMap<TKey>) :
            BooleanIterator() {
            private var _index = 0
            private var _currentValue = false

            override fun hasNext(): Boolean {
                while (_index < map._count) {
                    if (map._entries[_index].hashCode >= 0) {
                        _currentValue = map._entries[_index].value
                        _index++
                        return true
                    }
                }
                _index = map._count + 1
                _currentValue = false
                return false
            }

            override fun nextBoolean(): Boolean {
                return _currentValue
            }
        }
    }


    private class KeyCollection<TKey>(private val map: ObjectBooleanMap<TKey>) : Iterable<TKey> {
        override fun iterator(): Iterator<TKey> {
            return KeyIterator(map)
        }

        private class KeyIterator<TKey>(private val map: ObjectBooleanMap<TKey>) : Iterator<TKey> {
            private var _index = 0
            private var _currentValue = null as TKey

            override fun hasNext(): Boolean {
                while (_index < map._count) {
                    if (map._entries[_index].hashCode >= 0) {
                        _currentValue = map._entries[_index].key
                        _index++
                        return true
                    }
                }
                _index = map._count + 1
                _currentValue = null as TKey
                return false
            }

            override fun next(): TKey {
                return _currentValue
            }
        }
    }
}
