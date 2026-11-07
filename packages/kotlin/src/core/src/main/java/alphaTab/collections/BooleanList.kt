package alphaTab.collections

public interface IBooleanIterable : Iterable<Boolean> {
    public override fun iterator(): BooleanIterator
}

internal class BooleanList : IBooleanIterable {
    companion object {
        private const val DefaultCapacity: Int = 4
    }

    private var _data: BooleanArray
    private var _size: Int

    constructor(vararg elements: Boolean) {
        this._data = elements
        this._size = elements.size
    }

    constructor(size: Int) {
        this._data = BooleanArray(size)
        this._size = size
    }

    constructor(size: Double) : this(size.toInt())

    public val length: Double
        get() = _size.toDouble()

    public operator fun get(index: Int): Boolean {
        return _data[index]
    }

    public operator fun set(index: Int, value: Boolean) {
        _data[index] = value
    }

    public fun push(item: Boolean) {
        if (_size == _data.size) {
            val newCapacity = if (_data.isEmpty()) DefaultCapacity else 2 * _data.size
            _data = _data.copyOf(newCapacity)
        }
        _data[_size] = item
        _size++
    }

    public override fun iterator(): BooleanIterator {
        return Iterator(this)
    }

    public fun fill(b: Boolean): BooleanList {
        _data.fill(b, 0, _size)
        return this
    }

    public fun spread(): BooleanArray {
        return if (_size == _data.size) _data else _data.copyOf(_size)
    }

    public fun indexOf(v: Boolean): Double {
        for (i in 0 until _size) {
            if (_data[i] == v) {
                return i.toDouble()
            }
        }
        return -1.0
    }

    public fun <TOut> map(transform: (v: Boolean) -> TOut): List<TOut> {
        val mapped = List<TOut>()
        for (el in this) {
            mapped.push(transform(el))
        }
        return mapped
    }

    private class Iterator(private val list: BooleanList) : BooleanIterator() {
        private var _index = 0
        override fun hasNext(): Boolean {
            return _index < list._size
        }

        override fun nextBoolean(): Boolean {
            if (_index >= list._size) {
                throw NoSuchElementException("List has no more elements")
            }
            val value = list._data[_index]
            _index++
            return value
        }
    }
}
