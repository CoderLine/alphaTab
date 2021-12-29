package alphaTab.core.ecmaScript

@ExperimentalUnsignedTypes
class Uint8Array : Iterable<UByte> {
    private val _data: ArrayBuffer

    public val buffer: ArrayBuffer
        get() {
            return _data
        }

    public constructor(x: Iterable<Double>) {
        this._data = ArrayBuffer(x.map { d -> d.toInt().toUByte() }.toUByteArray())
    }

    public constructor(size: Double) {
        this._data = ArrayBuffer(UByteArray(size.toInt()))
    }

    public constructor(data: UByteArray) {
        this._data = ArrayBuffer(data)
    }

    public constructor(data:ArrayBuffer) {
        this._data = data
    }

    public val length: Double
        get() {
            return _data.raw.size.toDouble()
        }

    public operator fun get(idx: Int): Double {
        return _data.raw[idx].toDouble()
    }

    public operator fun get(idx: Double): Double {
        return _data.raw[idx.toInt()].toDouble()
    }

    public operator fun set(idx: Int, value: Double) {
        _data.raw[idx] = value.toInt().toUByte()
    }

    public fun set(subarray: Uint8Array, pos: Double) {
        subarray._data.raw.copyInto(_data.raw, pos.toInt(), 0, subarray._data.raw.size)
    }

    override fun iterator(): Iterator<UByte> {
        return _data.raw.iterator()
    }

    public fun subarray(begin: Double, end: Double): Uint8Array {
        return Uint8Array(_data.raw.copyOfRange(begin.toInt(), end.toInt()))
    }
}
