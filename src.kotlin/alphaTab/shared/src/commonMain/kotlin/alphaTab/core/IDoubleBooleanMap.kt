package alphaTab.core

public interface IDoubleBooleanMap : IMap<Double, Boolean> {
}

public class DoubleBooleanMap : IDoubleBooleanMap {
    class Entry {
        public var hashCode: Int = 0
        public var next: Int = 0
        public var key: Double = 0.0
        public var value: Boolean = false
    }

    private var _buckets: IntArray? = null
    private var _entries: Array<Entry>? = null
    private var _count: Int = 0
    private var _freeList: Int = 0
    private var _freeCount: Int = 0

    override val size: Double
        get() = (_count - _freeCount).toDouble()

    override fun has(key: Double): Boolean {
        return findEntry(key) >= 0
    }

    override fun get(key: Double): Boolean {
        val i = findEntry(key)
        if (i >= 0) {
            return _entries!![i].value
        }
        throw IllegalStateException("key not in map")
    }

    override fun set(key: Double, value: Boolean) {
        if (_buckets == null) {
            initialize(0)
        }
        val buckets = _buckets!!
        var entries = _entries!!

        val hashCode = key.hashCode() and 0x7FFFFFFF
        var targetBucket = hashCode % buckets.size

        var i = buckets[targetBucket]
        while (i >= 0) {
            if (entries[i].hashCode == hashCode && entries[i].key == key) {
                entries[i].value = value
                return
            }
            i = entries[i].next
        }

        var index: Int
        if (_freeCount > 0) {
            index = _freeList
            _freeList = entries[index].next
            _freeCount--
        } else {
            if (_count == entries.size) {
                resize()
                entries = _entries!!
                targetBucket = hashCode % buckets.size
            }
            index = _count
            _count++
        }

        entries[index].hashCode = hashCode
        entries[index].next = buckets[targetBucket]
        entries[index].key = key
        entries[index].value = value
    }

    private fun resize() {
        resize(HashHelper.expandPrime(_count), false);
    }

    private fun resize(newSize: Int, forceNewHashCodes: Boolean) {
        val newBuckets = IntArray(newSize) { -1 }
        var i: Int

        val currentEntries = _entries!!
        val newEntries = Array(newSize) {
            if (it < _count) currentEntries[it] else Entry()
        }
        if (forceNewHashCodes) {
            i = 0
            while (i < _count) {
                if (newEntries[i].hashCode != -1) {
                    newEntries[i].hashCode = (newEntries[i].key.hashCode() and 0x7FFFFFFF);
                }
                i++
            }
        }

        i = 0
        while (i < _count) {
            if (newEntries[i].hashCode >= 0) {
                val bucket = newEntries[i].hashCode % newSize
                newEntries[i].next = newBuckets[bucket]
                newBuckets[bucket] = i
            }
            i++;
        }
        _buckets = newBuckets;
        _entries = newEntries;
    }

    private fun initialize(capacity: Int) {
        val size = HashHelper.getPrime(capacity)
        _buckets = IntArray(size) { -1 }
        _entries = Array(size) {
            Entry()
        }
        _freeList = -1
    }

    override fun delete(key: Double) {
        val buckets = _buckets
        val entries = _entries
        if (buckets != null && entries != null) {
            val hashCode = key.hashCode() and 0x7FFFFFFF
            val bucket = hashCode % buckets.size
            var last = -1
            var i = buckets[bucket]
            while (i >= 0) {
                if (entries[i].hashCode == hashCode && entries[i].key == key) {
                    if (last < 0) {
                        buckets[bucket] = entries[i].next
                    } else {
                        entries[last].next = entries[i].next
                    }
                    entries[i].hashCode = -1
                    entries[i].next = _freeList
                    entries[i].key = 0.0
                    entries[i].value = false
                    _freeList = i
                    _freeCount++
                    return
                }

                last = i
                i = entries[i].next
            }
        }
    }

    override fun values(): Iterable<Boolean> {
        return null!! // ValueCollection(this)
    }

    override fun keys(): Iterable<Double> {
        return null!! // KeyCollection(this)
    }

    override fun clear() {
        if (_count > 0) {
            var i = 0
            _buckets?.fill(-1)
            _entries = emptyArray()
            _freeList = -1
            _count = 0
            _freeCount = 0
        }
    }

    override fun iterator(): Iterator<Pair<Double, Boolean>> {
        return MapIterator(this)
    }

    class MapIterator : Iterator<Pair<Double, Boolean>> {
        private val _map: DoubleBooleanMap
        private var _index: Int = 0

        public constructor(map: DoubleBooleanMap) {
            _map = map
        }

        override fun hasNext(): Boolean {
            TODO("Not yet implemented")
        }

        override fun next(): Pair<Double, Boolean> {
            TODO("Not yet implemented")
        }
    }

    private fun findEntry(key: Double): Int {
        val buckets = _buckets
        val entries = _entries
        if (buckets != null && entries != null) {
            val hashCode = key.hashCode() and 0x7FFFFFFF
            var i = buckets[hashCode % buckets.size]
            while (i >= 0) {
                if (entries[i].hashCode == hashCode && entries[i].key == key) {
                    return i
                }
                i = entries[i].next
            }
        }
        return -1
    }
}
