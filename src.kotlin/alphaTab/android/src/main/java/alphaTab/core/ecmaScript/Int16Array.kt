package alphaTab.core.ecmaScript

import alphaTab.core.byteLength

@Suppress("NOTHING_TO_INLINE")
@ExperimentalUnsignedTypes
internal class Int16Array : Iterable<Short> {
    private val _data: ShortArray

    public val length: Double
        get() = _data.size.toDouble()

    public constructor(size: Double) {
        _data = ShortArray(size.toInt())
    }

    public inline operator fun get(index: Double): Double {
        return get(index.toInt())
    }

    public inline operator fun set(index: Double, value: Double) {
        set(index.toInt(), value)
    }

    public inline operator fun get(index: Int): Double {
        return _data[index].toDouble()
    }

    public inline operator fun set(index: Int, value: Double) {
        _data[index] = value.toInt().toShort()
    }

    override fun iterator(): ShortIterator {
        return _data.iterator()
    }
}
