package alphaTab.collections

import org.eclipse.collections.impl.list.mutable.primitive.DoubleArrayList

public actual class DoubleList : IDoubleIterable {
    private var _data: DoubleArrayList

    public actual val length: Double
        get() = _data.size().toDouble()

    public actual constructor() {
        _data = DoubleArrayList()
    }

    public actual constructor(size: Int) {
        _data = DoubleArrayList.newWithNValues(size, 0.0)
    }

    public actual constructor(vararg elements: Double) {
        _data = DoubleArrayList.newListWith(*elements)
    }

    private constructor(data: DoubleArrayList) {
        _data = data
    }

    public operator actual fun get(index: Int): Double {
        return _data[index]
    }

    public operator actual fun set(index: Int, value: Double) {
        _data[index] = value
    }

    public actual fun push(item: Double) {
        _data.add(item)
    }

    public actual fun join(separator: String): String {
        return _data.makeString(separator)
    }

    public actual fun <TOut> map(transform: (v: Double) -> TOut): alphaTab.collections.List<TOut> {
        val mapped = List<TOut>()
        _data.forEach {
            mapped.push(transform(it))
        }
        return mapped
    }

    public actual fun map(transform: (v: Double) -> Double): DoubleList {
        val mapped = DoubleList(_data.size())
        _data.forEachWithIndex { value, index ->
            mapped[index] = transform(value)
        }
        return mapped
    }

    public actual fun reverse(): DoubleList {
        _data.reverseThis()
        return this
    }

    public actual fun fill(value: Double): DoubleList {
        _data = DoubleArrayList.newWithNValues(_data.size(), value)
        return this
    }

    public actual fun slice(): DoubleList {
        return DoubleList(DoubleArrayList.newList(_data))
    }

    public actual fun sort() {
        _data.sortThis()
    }

    public override fun iterator(): DoubleIterator {
        return EclipseDoubleIterator(_data.doubleIterator())
    }
}

