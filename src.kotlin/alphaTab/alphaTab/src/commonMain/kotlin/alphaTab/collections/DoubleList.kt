package alphaTab.collections

import alphaTab.core.toInvariantString

public interface IDoubleIterable : Iterable<Double> {
    override fun iterator(): DoubleIterator
}

public class DoubleList : IDoubleIterable {
    companion object {
        private const val DefaultCapacity: Int = 4
    }

    private var _items: DoubleArray
    private var _size: Int = 0

    public val length: Double get() = _size.toDouble()

    public constructor() {
        _items = DoubleArray(0)
    }

    public constructor(size: Int) {
        _items = DoubleArray(size)
        _size = size
    }

    public constructor(vararg elements: Double) {
        _items = elements
        _size = elements.size
    }

    private constructor(elements: DoubleArray, size: Int) {
        _items = elements
        _size = size
    }

    public operator fun get(index: Int): Double {
        return _items[index]
    }

    public operator fun set(index: Int, value: Double) {
        _items[index] = value
    }

    public fun push(item: Double) {
        val array = _items
        val size = _size
        if (size < array.size) {
            _size = size + 1
            array[size] = item
        } else {
            addWithResize(item)
        }
    }

    private fun addWithResize(item: Double) {
        val size = _size
        grow(size + 1)
        _size = (size + 1)
        _items[size] = item
    }

    private fun grow(capacity: Int) {
        var newCapacity = if (_items.isEmpty()) DefaultCapacity else 2 * _items.size
        if (newCapacity < capacity) {
            newCapacity = capacity
        }

        val newItems = DoubleArray(newCapacity)
        if (_size > 0) {
            _items.copyInto(newItems, 0, 0, _size)
        }
        _items = newItems
    }

    public fun join(separator: String): String {
        return this.map<String> { it.toInvariantString() }.joinToString(separator)
    }

    public fun <TOut> map(transform: (v: Double) -> TOut): List<TOut> {
        val mapped = List<TOut>()
        for (el in this) {
            mapped.push(transform(el))
        }
        return mapped
    }

    public fun map(transform: (v: Double) -> Double): DoubleList {
        val mapped = DoubleList(_size)
        for (i in 0 until _size) {
            mapped[i] = transform(_items[i])
        }
        return mapped
    }

    public fun reverse(): DoubleList {
        _items.reverse(0, _size)
        return this
    }

    public fun fill(value: Double): DoubleList {
        _items.fill(value)
        return this
    }

    public fun slice(): DoubleList {
        val copy = DoubleArray(_size) {
            _items[it]
        }
        return DoubleList(copy, _size)
    }

    public fun sort() {
        _items.sort(0, _size)
    }

    public fun shift(): Double {
        val d = _items[0]
        if (_items.size > 1) {
            _items = _items.copyOfRange(1, _items.size)
        } else {
            _items = DoubleArray(0)
        }
        _size--
        return d
    }

    public override fun iterator(): DoubleIterator {
        return Iterator(this)
    }

    private class Iterator(private val list: DoubleList) : DoubleIterator() {
        private var _index = 0
        override fun hasNext(): Boolean {
            return _index < list._size
        }

        override fun nextDouble(): Double {
            if (_index >= list._size) {
                throw NoSuchElementException("List has no more elements")
            }
            val value = list[_index]
            _index++
            return value
        }
    }
}
