package alphaTab.collections

public interface IBooleanIterable : Iterable<Boolean> {
    public override fun iterator(): BooleanIterator
}

internal class BooleanList : IBooleanIterable {
    private val _data: BooleanArray

    constructor(vararg elements: Boolean) {
        this._data = elements
    }

    constructor(size: Int) {
        this._data = BooleanArray(size)
    }

    constructor(size: Double) {
        this._data = BooleanArray(size.toInt())
    }

    public val length: Double
        get() = _data.size.toDouble()

    public operator fun get(index: Int): Boolean {
        return _data[index]
    }

    public operator fun set(index: Int, value: Boolean) {
        _data[index] = value
    }

    public override fun iterator(): BooleanIterator {
        return _data.iterator()
    }

    public fun fill(b: Boolean) {
        _data.fill(b)
    }

    @Suppress("NOTHING_TO_INLINE")
    public inline fun spread(): BooleanArray {
        return _data;
    }

    @Suppress("NOTHING_TO_INLINE")
    public inline fun indexOf(v: Boolean): Double {
        return _data.indexOf(v).toDouble()
    }

    public fun <TOut> map(transform: (v: Boolean) -> TOut): List<TOut> {
        val mapped = List<TOut>()
        for (el in this) {
            mapped.push(transform(el))
        }
        return mapped
    }
}
