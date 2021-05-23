package alphaTab.core.ecmaScript

@ExperimentalUnsignedTypes
class Uint8Array : Iterable<UByte> {
    private val _data: UByteArray

    public val buffer: ArrayBuffer
        get() {
            return ArrayBuffer(_data)
        }

    public constructor(x: List<Double>) {
        this._data = x.map { d -> d.toInt().toUByte() }.toUByteArray()
    }

    public constructor(size: Double) {
        this._data = UByteArray(size.toInt())
    }

    public constructor(data: UByteArray) {
        this._data = data
    }

    public val length: Double
        get() {
            return _data.size.toDouble()
        }

    public operator fun get(idx: Int): Double {
        return _data[idx].toDouble()
    }

    public operator fun get(idx: Double): Double {
        return _data[idx.toInt()].toDouble()
    }

    public operator fun set(idx: Int, value: Double) {
        _data[idx] = value.toInt().toUByte()
    }

    public fun set(subarray: Uint8Array, pos: Double) {
        subarray._data.copyInto(_data, pos.toInt(), 0, subarray._data.size)
    }

    override fun iterator(): Iterator<UByte> {
        return _data.iterator()
    }

    public fun subarray(begin: Double, end: Double): Uint8Array {
        return Uint8Array(_data.copyOfRange(begin.toInt(), end.toInt()))
    }
}
