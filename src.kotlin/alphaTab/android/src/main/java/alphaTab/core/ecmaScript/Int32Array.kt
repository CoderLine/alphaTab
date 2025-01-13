package alphaTab.core.ecmaScript

internal class Int32Array : Iterable<Int> {
    private val _data: IntArray
    private val _offset: Int
    public val length: Double

    public constructor(size: Double) {
        _data = IntArray(size.toInt())
        length = size
        _offset = 0
    }

    public constructor(values: Iterable<Double>) {
        _data = values.map { it.toInt() }.toIntArray();
        length = _data.size.toDouble()
        _offset = 0
    }

    private constructor(values: IntArray, offset: Int, length: Int) {
        _data = values
        this.length = length.toDouble()
        _offset = offset
    }

    public operator fun get(index: Double): Double {
        return get(index.toInt())
    }

    public operator fun get(index: Int): Double {
        return _data[_offset + index].toDouble()
    }

    public operator fun set(index: Double, value: Double) {
        set(index.toInt(), value)
    }

    public operator fun set(index: Int, value: Double) {
        _data[_offset + index] = value.toInt()
    }

    public operator fun set(index: Int, value: Int) {
        _data[_offset + index] = value
    }

    public fun fill(i: Int) {
        _data.fill(i)
    }

    override fun iterator(): Iterator<Int> {
        return (0 until length.toInt()).map { _data[_offset + it] }.iterator()
    }

    fun subarray(start: Double, end: Double): Int32Array {
        return Int32Array(
            _data,
            _offset + start.toInt(),
            (end - start).toInt()
        )
    }

    fun set(values: Int32Array, offset: Double) {
        values._data.copyInto(
            _data,
            _offset + offset.toInt(),
            values._offset,
            values._offset + values._data.size
        )
    }

}
