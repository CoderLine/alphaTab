package alphaTab.core.ecmaScript

@Suppress("NOTHING_TO_INLINE")
@ExperimentalUnsignedTypes
internal class Uint16Array : Iterable<UShort> {
    private val _data: UShortArray
    private val _offset: Int
    public val length: Double

    public constructor(size: Double) {
        _data = UShortArray(size.toInt())
        _offset = 0
        length = size
    }

    public constructor(values: Iterable<Double>) {
        val list = values.toList()
        _data = UShortArray(list.size)
        for (i in list.indices) {
            _data[i] = list[i].toInt().toUShort()
        }
        _offset = 0
        length = list.size.toDouble()
    }

    private constructor(data: UShortArray, offset: Int, length: Int) {
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
        _data[_offset + index] = value.toInt().toUShort()
    }

    public fun fill(value: Double) {
        _data.fill(value.toInt().toUShort(), _offset, _offset + length.toInt())
    }

    public fun subarray(start: Double, end: Double): Uint16Array {
        return Uint16Array(_data, _offset + start.toInt(), (end - start).toInt())
    }

    public fun set(values: Uint16Array, offset: Double) {
        values._data.copyInto(
            _data,
            _offset + offset.toInt(),
            values._offset,
            values._offset + values.length.toInt()
        )
    }

    override fun iterator(): Iterator<UShort> {
        return object : Iterator<UShort> {
            private var _index = 0
            override fun hasNext(): Boolean = _index < length.toInt()
            override fun next(): UShort = _data[_offset + _index++]
        }
    }
}
