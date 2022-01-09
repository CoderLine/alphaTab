package alphaTab.core.ecmaScript

@Suppress("NOTHING_TO_INLINE")
@ExperimentalUnsignedTypes
class Uint8Array : Iterable<UByte> {
    public val buffer: ArrayBuffer

    public constructor(x: Iterable<Double>) {
        this.buffer = ArrayBuffer(x.map { d -> d.toInt().toUByte() }.toUByteArray())
    }

    public constructor(size: Double) {
        this.buffer = ArrayBuffer(UByteArray(size.toInt()))
    }

    public constructor(data: UByteArray) {
        this.buffer = ArrayBuffer(data)
    }

    public constructor(data:ArrayBuffer) {
        this.buffer = data
    }

    public val length: Double
        get() {
            return this.buffer.raw.size.toDouble()
        }

    public inline operator fun get(idx: Int): Double {
        return this.buffer.raw[idx].toDouble()
    }

    public inline operator fun get(idx: Double): Double {
        return this.buffer.raw[idx.toInt()].toDouble()
    }

    public inline operator fun set(idx: Int, value: Double) {
        this.buffer.raw[idx] = value.toInt().toUByte()
    }

    public inline fun set(subarray: Uint8Array, pos: Double) {
        subarray.buffer.raw.copyInto(buffer.raw, pos.toInt(), 0, subarray.buffer.raw.size)
    }

    override fun iterator(): Iterator<UByte> {
        return buffer.raw.iterator()
    }

    public fun subarray(begin: Double, end: Double): Uint8Array {
        return Uint8Array(buffer.raw.copyOfRange(begin.toInt(), end.toInt()))
    }
}
