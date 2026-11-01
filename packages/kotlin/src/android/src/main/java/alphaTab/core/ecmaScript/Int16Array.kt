package alphaTab.core.ecmaScript

@Suppress("NOTHING_TO_INLINE")
internal class Int16Array : Iterable<Short> {
    private val _data: ShortArray
    private val _offset: Int
    public val length: Double

    public constructor(size: Double) {
        _data = ShortArray(size.toInt())
        _offset = 0
        length = size
    }

    public constructor(values: Iterable<Double>) {
        val list = values.toList()
        _data = ShortArray(list.size)
        for (i in list.indices) {
            _data[i] = list[i].toInt().toShort()
        }
        _offset = 0
        length = list.size.toDouble()
    }

    private constructor(data: ShortArray, offset: Int, length: Int) {
        _data = data
        _offset = offset
        this.length = length.toDouble()
    }

    public inline operator fun get(index: Double): Double {
        return get(index.toInt())
    }

    public inline operator fun set(index: Double, value: Double) {
        set(index.toInt(), value)
    }

    public inline operator fun get(index: Int): Double {
        return _data[_offset + index].toDouble()
    }

    public inline operator fun set(index: Int, value: Double) {
        _data[_offset + index] = value.toInt().toShort()
    }

    public fun fill(value: Double) {
        _data.fill(value.toInt().toShort(), _offset, _offset + length.toInt())
    }

    public fun subarray(start: Double, end: Double): Int16Array {
        return Int16Array(_data, _offset + start.toInt(), (end - start).toInt())
    }

    public fun set(values: Int16Array, offset: Double) {
        values._data.copyInto(
            _data,
            _offset + offset.toInt(),
            values._offset,
            values._offset + values.length.toInt()
        )
    }

    override fun iterator(): Iterator<Short> {
        return object : Iterator<Short> {
            private var _index = 0
            override fun hasNext(): Boolean = _index < length.toInt()
            override fun next(): Short = _data[_offset + _index++]
        }
    }
}
