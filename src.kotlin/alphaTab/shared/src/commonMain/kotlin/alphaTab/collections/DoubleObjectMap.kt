package alphaTab.collections

internal open class DoubleObjectMapEntry<TValue> {
    private val _key: Double
    public open val key: Double
        get() = _key

    private val _value: TValue
    public open val value: TValue
        get() = _value

    public fun component1(): Double {
        return _key
    }

    public fun component2(): TValue {
        return _value
    }

    public constructor() {
        _key = 0.0
        _value = null as TValue
    }

    public constructor(key: Double, value: TValue) {
        _key = key
        _value = value
    }
}

internal class DoubleObjectMapEntryInternal<TValue> : DoubleObjectMapEntry<TValue>() {
    public var hashCode: Int = 0
    public var next: Int = 0
    public override var key: Double = 0.0
    public override var value: TValue = null as TValue
}

internal class DoubleObjectMap<TValue> : Iterable<DoubleObjectMapEntry<TValue>> {
    private var _count: Int = 0
    private var _freeCount: Int = 0
    private var _buckets: IntArray? = null
    private var _entries: Array<DoubleObjectMapEntryInternal<TValue>> = arrayOf()
    private var _freeList: Int = 0

    public val size: Double
        get() = (_count - _freeCount).toDouble()

    public constructor()
    public constructor(iterable: Iterable<DoubleObjectMapEntry<TValue>>) {
        for (it in iterable) {
            set(it.key, it.value)
        }
    }

    public fun has(key: Double): Boolean {
        return findEntry(key) >= 0
    }

    private fun findEntry(key: Double): Int {
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

    public fun get(key: Double): TValue {
        val i = findEntry(key)
        if (i >= 0) return _entries[i].value
        throw KeyNotFoundException()
    }

    public fun set(key: Double, value: TValue) {
        insert(key, value)
    }

    private fun insert(key: Double, value: TValue) {
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
            DoubleObjectMapEntryInternal<TValue>()
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
            DoubleObjectMapEntryInternal()
        }
        _freeList = -1
        return _buckets!!
    }

    public fun delete(key: Double) {
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
                    _entries[i].key = 0.0
                    _entries[i].value = null as TValue
                    _freeList = i
                    _freeCount++
                    return
                }


                last = i
                i = _entries[i].next
            }
        }
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

    public fun clear() {
        if (_count > 0) {
            _buckets?.fill(-1)
            _entries.fill(DoubleObjectMapEntryInternal())
            _freeList = -1
            _count = 0
            _freeCount = 0
        }
    }

    override fun iterator(): Iterator<DoubleObjectMapEntry<TValue>> {
        return MapIterator(this)
    }

    private class MapIterator<TValue>(private val map: DoubleObjectMap<TValue>) : Iterator<DoubleObjectMapEntry<TValue>> {
        private var _index = 0
        private var _currentValue: DoubleObjectMapEntry<TValue>? = null

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

        override fun next(): DoubleObjectMapEntry<TValue> {
            return _currentValue!!
        }
    }

    private class ValueCollection<TValue>(private val map: DoubleObjectMap<TValue>) : Iterable<TValue> {
        override fun iterator(): Iterator<TValue> {
            return ValueIterator(map)
        }

        private class ValueIterator<TValue>(private val map: DoubleObjectMap<TValue>) : Iterator<TValue> {
            private var _index = 0
            private var _currentValue = null as TValue

            override fun hasNext(): Boolean {
                while (_index < map._count) {
                    if (map._entries[_index].hashCode >= 0) {
                        _currentValue = map._entries[_index].value
                        _index++
                        return true
                    }
                }
                _index = map._count + 1
                _currentValue = null as TValue
                return false
            }

            override fun next(): TValue {
                return _currentValue
            }
        }
    }


    private class KeyCollection<TValue>(private val map: DoubleObjectMap<TValue>) : IDoubleIterable {
        override fun iterator(): DoubleIterator {
            return KeyIterator(map)
        }

        private class KeyIterator<TValue>(private val map: DoubleObjectMap<TValue>) : DoubleIterator() {
            private var _index = 0
            private var _currentValue = 0.0

            override fun hasNext(): Boolean {
                while (_index < map._count) {
                    if (map._entries[_index].hashCode >= 0) {
                        _currentValue = map._entries[_index].key
                        _index++
                        return true
                    }
                }
                _index = map._count + 1
                _currentValue = 0.0
                return false
            }

            override fun nextDouble(): Double {
                return _currentValue
            }
        }
    }
}
