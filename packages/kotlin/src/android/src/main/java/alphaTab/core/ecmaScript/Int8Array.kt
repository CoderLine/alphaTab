package alphaTab.core.ecmaScript

@Suppress("NOTHING_TO_INLINE")
internal class Int8Array : Iterable<Byte> {
    private val _data: ByteArray
    private val _offset: Int
    public val length: Double

    public constructor(size: Double) {
        _data = ByteArray(size.toInt())
        _offset = 0
        length = size
    }

    public constructor(values: Iterable<Double>) {
        val list = values.toList()
        _data = ByteArray(list.size)
        for (i in list.indices) {
            _data[i] = list[i].toInt().toByte()
        }
        _offset = 0
        length = list.size.toDouble()
    }

    private constructor(data: ByteArray, offset: Int, length: Int) {
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
        _data[_offset + index] = value.toInt().toByte()
    }

    public fun fill(value: Double) {
        _data.fill(value.toInt().toByte(), _offset, _offset + length.toInt())
    }

    public fun subarray(start: Double, end: Double): Int8Array {
        return Int8Array(_data, _offset + start.toInt(), (end - start).toInt())
    }

    public fun set(values: Int8Array, offset: Double) {
        values._data.copyInto(
            _data,
            _offset + offset.toInt(),
            values._offset,
            values._offset + values.length.toInt()
        )
    }

    override fun iterator(): Iterator<Byte> {
        return object : Iterator<Byte> {
            private var _index = 0
            override fun hasNext(): Boolean = _index < length.toInt()
            override fun next(): Byte = _data[_offset + _index++]
        }
    }
}
