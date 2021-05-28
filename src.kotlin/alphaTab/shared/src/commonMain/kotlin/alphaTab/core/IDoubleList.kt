package alphaTab.core

import kotlin.collections.List


// TODO: check if using IList<Double> causes compiler to generate "object" overloads instead of "double" which would cause auto-boxing
public interface IDoubleList : IList<Double> {
    override fun get(index: Int): Double
    override fun set(index: Int, value: Double)
    override fun indexOf(value: Double): Double
    override fun push(item: Double)
    override fun pop(): Double
    override fun sort(comparison: (a: Double, b: Double) -> Double)
    override fun <TOut> map(transform: (v: Double) -> TOut): IList<TOut>
    override fun map(transform: (v: Double) -> Double): IDoubleList
    override fun slice(start: Double): IList<Double>
    override fun splice(start: Double, deleteCount: Double)
    override fun splice(start: Double, deleteCount: Double, newElements: List<Double>)
    override fun reverse(): IDoubleList
    override fun fill(value: Double): IDoubleList
    override fun filter(predicate: (Double) -> Boolean): IDoubleList
    override fun iterator(): DoubleIterator
    override fun slice(): IDoubleList
    fun sort()
}

public fun doubleListOf(): IDoubleList = DoubleList()
public fun doubleListOf(vararg elements: Double): IDoubleList = DoubleList(*elements)
public fun IDoubleList.splice(start: Double, deleteCount: Double, vararg newElements: Double) {
    this.splice(start, deleteCount, newElements.asList())
}

public class DoubleList : IDoubleList {
    companion object {
        const val DefaultCapacity = 4
        val EmptyArray = DoubleArray(0)
    }

    private var _data: DoubleArray
    private var _length: Int

    public constructor() {
        _data = EmptyArray
        _length = 0
    }

    public constructor(size: Int) {
        _data = DoubleArray(size)
        _length = size;
    }

    public constructor(vararg elements: Double) {
        _data = elements
        _length = _data.size
    }

    public constructor(elements: Iterable<Double>) {
        _data = elements.toList().toDoubleArray()
        _length = _data.size
    }

    override fun reverse(): IDoubleList {
        _data.reverse()
        return this
    }

    override fun slice(start: Double): IDoubleList {
        return DoubleList(*_data.copyOfRange(start.toInt(), _data.size))
    }

    override fun slice(): IDoubleList {
        return DoubleList(*_data.copyOf())
    }

    override fun fill(value: Double): IDoubleList {
        _data.fill(value)
        return this
    }

    override val length: Double
        get() = _length.toDouble()

    override fun get(index: Int): Double = _data[index]

    override fun set(index: Int, value: Double) {
        _data[index] = value
    }

    override fun indexOf(value: Double): Double {
        return _data.indexOfFirst { it == value }.toDouble()
    }

    override fun push(item: Double) {
        if (_length < _data.size) {
            _length++
            _data[_length] = item
        } else {
            pushWithResize(item)
        }
    }

    private fun pushWithResize(item: Double) {
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

        val newItems = DoubleArray(newCapacity)
        if (_length > 0) {
            _data.copyInto(newItems)
        }
        _data = newItems
    }

    override fun pop(): Double {
        var last = _data.last()
        _length--
        return last;
    }

    override fun sort() {
        _data.sort()
    }

    override fun sort(comparison: (a: Double, b: Double) -> Double) {
        _data = _data.sortedWith { a, b -> comparison(a, b).toInt() }.toDoubleArray()
    }

    override fun filter(predicate: (Double) -> Boolean): IDoubleList {
        return DoubleList(_data.filter(predicate))
    }

    override fun <TOut> map(transform: (v: Double) -> TOut): IList<TOut> {
        return _data.map(transform).toObjectList()
    }

    override fun map(transform: (v: Double) -> Double): IDoubleList {
        return DoubleList(_data.map(transform))
    }

    override fun splice(start: Double, deleteCount: Double) {
        doSplice(start, deleteCount, null)
    }

    override fun splice(
        start: Double,
        deleteCount: Double,
        newElements: kotlin.collections.List<Double>
    ) {
        doSplice(start, deleteCount, newElements)
    }

    private fun doSplice(
        start: Double,
        deleteCount: Double,
        newElements: kotlin.collections.List<Double>?
    ) {
        val startIndex = start.toInt()
        val newElementCount = newElements?.size ?: 0

        val newData = DoubleArray(_length - deleteCount.toInt() + newElementCount)
        // copy items before changed pos
        if (startIndex > 0) {
            _data.copyInto(newData, 0, 0, startIndex)
        }
        // insert new items
        if (newElementCount > 0) {
            newElements!!.toDoubleArray().copyInto(newData, startIndex, 0)
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

    override fun iterator(): DoubleIterator {
        return _data.iterator()
    }
}
