package alphaTab.core

import kotlin.collections.List

public interface IBooleanList : IList<Boolean> {
    override fun get(index: Int): Boolean
    override fun set(index: Int, value: Boolean)
    override fun indexOf(value: Boolean): Double
    override fun push(item: Boolean)
    override fun pop(): Boolean
    override fun sort(comparison: (a: Boolean, b: Boolean) -> Double)
    override fun <TOut> map(transform: (v: Boolean) -> TOut): IList<TOut>
    override fun map(transform: (v: Boolean) -> Double): IDoubleList
    override fun slice(start: Double): IList<Boolean>
    override fun splice(start: Double, deleteCount: Double)
    override fun splice(start: Double, deleteCount: Double, newElements: List<Boolean>)
    override fun reverse(): IBooleanList
    override fun fill(value: Boolean): IBooleanList
    override fun filter(predicate: (Boolean) -> Boolean): IBooleanList
    override fun iterator(): BooleanIterator
    override fun slice(): IBooleanList
}

public fun booleanListOf(): IBooleanList = BooleanList()
public fun booleanListOf(vararg elements: Boolean): IBooleanList = BooleanList(*elements)
public fun IBooleanList.splice(start: Double, deleteCount: Double, vararg newElements: Boolean) {
    this.splice(start, deleteCount, newElements.asList())
}

public class BooleanList : IBooleanList {
    companion object {
        const val DefaultCapacity = 4
        val EmptyArray = BooleanArray(0)
    }

    private var _data: BooleanArray
    private var _length: Int

    public constructor() {
        _data = EmptyArray
        _length = 0
    }

    public constructor(size: Int) {
        _data = BooleanArray(size)
        _length = size;
    }

    public constructor(vararg elements: Boolean) {
        _data = elements
        _length = _data.size
    }

    public constructor(elements: Iterable<Boolean>) {
        _data = elements.toList().toBooleanArray()
        _length = _data.size
    }

    override fun reverse(): IBooleanList {
        _data.reverse()
        return this
    }

    override fun slice(start: Double): IBooleanList {
        return BooleanList(*_data.copyOfRange(start.toInt(), _data.size))
    }

    override fun slice(): IBooleanList {
        return BooleanList(*_data.copyOf())
    }

    override fun fill(value: Boolean): IBooleanList {
        _data.fill(value)
        return this
    }

    override val length: Double
        get() = _length.toDouble()

    override fun get(index: Int): Boolean = _data[index]

    override fun set(index: Int, value: Boolean) {
        _data[index] = value
    }

    override fun indexOf(value: Boolean): Double {
        return _data.indexOfFirst { it == value }.toDouble()
    }

    override fun push(item: Boolean) {
        if (_length < _data.size) {
            _length++
            _data[_length] = item
        } else {
            pushWithResize(item)
        }
    }

    private fun pushWithResize(item: Boolean) {
        val size = _length
        resizeTo(size + 1)
        _length = size + 1
        _data[size] = item
    }

    private fun resizeTo(capacity: Int) {
        var newCapacity: Int = if (_data.isEmpty()) DefaultCapacity else 2 * _data.size
        if (newCapacity < capacity) {
            newCapacity = capacity
        }

        val newItems = BooleanArray(newCapacity)
        if (_length > 0) {
            _data.copyInto(newItems)
        }

        _data = newItems
    }

    override fun pop(): Boolean {
        val last = _data.last()
        _length--
        return last;
    }

    override fun sort(comparison: (a: Boolean, b: Boolean) -> Double) {
        _data = _data.sortedWith { a, b -> comparison(a, b).toInt() }.toBooleanArray()
    }

    override fun filter(predicate: (Boolean) -> Boolean): IBooleanList {
        return BooleanList(_data.filter(predicate))
    }

    override fun <TOut> map(transform: (v: Boolean) -> TOut): IList<TOut> {
        return _data.map(transform).toObjectList()
    }

    override fun map(transform: (v: Boolean) -> Double): IDoubleList {
        return DoubleList(_data.map(transform))
    }

    override fun splice(start: Double, deleteCount: Double) {
        doSplice(start, deleteCount, null)
    }

    override fun splice(
        start: Double,
        deleteCount: Double,
        newElements: kotlin.collections.List<Boolean>
    ) {
        doSplice(start, deleteCount, newElements)
    }

    private fun doSplice(
        start: Double,
        deleteCount: Double,
        newElements: kotlin.collections.List<Boolean>?
    ) {
        val startIndex = start.toInt()
        val newElementCount = newElements?.size ?: 0

        val newData = BooleanArray(_length - deleteCount.toInt() + newElementCount)
        // copy items before changed pos
        if (startIndex > 0) {
            _data.copyInto(newData, 0, 0, startIndex)
        }
        // insert new items
        if (newElementCount > 0) {
            newElements!!.toBooleanArray().copyInto(newData, startIndex, 0)
        }
        // copy remaining items
        _data.copyInto(
            newData,
            start.toInt() + newElementCount,
            start.toInt() + deleteCount.toInt()
        )
    }

    override fun join(separator: String): String {
        return _data.joinToString(separator)
    }

    override fun iterator(): BooleanIterator {
        return _data.iterator()
    }
}
