package alphaTab.collections

public interface IDoubleIterable : Iterable<Double> {
    override fun iterator(): DoubleIterator
}

public class DoubleList : IDoubleIterable {
    companion object {
        private const val DefaultCapacity:Int = 4
    }

    private var _items: DoubleArray
    private var _size: Double = 0.0

    public val length: Double = _size

    public constructor() {
        _items = DoubleArray(0)
    }

    public constructor(size: Int) {
        _items = DoubleArray(size)
    }

    public constructor(vararg elements: Double) {
        _items = elements
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
            _size += 1
            array[_size.toInt()] = item
        } else {
            addWithResize(item)
        }
    }

    private fun addWithResize(item: Double) {
        val size = _size.toInt()
        grow(size + 1)
        _size++
        _items[size] = item
    }

    private fun grow(capacity: Int) {
        var newCapacity = if (_items.isEmpty()) DefaultCapacity else 2 * _items.size
        if (newCapacity < capacity) {
            newCapacity = capacity
        }

        val newItems = DoubleArray(newCapacity)
        if (_size > 0) {
            _items.copyInto(newItems, 0, 0, _size.toInt())
        }
        _items = newItems
    }

    public fun join(separator: String): String {
        return _items.joinToString(separator)
    }

    public fun <TOut> map(transform: (v: Double) -> TOut): List<TOut> {
        val mapped = List<TOut>()
        for (el in _items) {
            mapped.push(transform(el))
        }
        return mapped
    }

    public fun map(transform: (v: Double) -> Double): DoubleList {
        val mapped = DoubleList(_items.size)
        for (i in _items.indices) {
            mapped[i] = transform(_items[i])
        }
        return mapped
    }

    public fun reverse(): DoubleList {
        _items.reverse()
        return this
    }

    public fun fill(value: Double): DoubleList {
        _items.fill(value)
        return this
    }

    public fun slice(): DoubleList {
        return DoubleList(*_items)
    }

    public fun sort() {
        _items.sort()
    }

    public override fun iterator(): DoubleIterator {
        return _items.iterator()
    }
}
