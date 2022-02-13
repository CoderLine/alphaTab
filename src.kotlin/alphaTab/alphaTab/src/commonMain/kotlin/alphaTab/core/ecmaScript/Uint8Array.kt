package alphaTab.core.ecmaScript

@Suppress("NOTHING_TO_INLINE")
@ExperimentalUnsignedTypes
class Uint8Array : Iterable<UByte> {
    public val buffer: ArrayBuffer

    public constructor(x: Iterable<Double>) {
        this.buffer = x.map { d -> d.toInt().toUByte() }.toUByteArray()
    }

    public constructor(size: Double) {
        this.buffer = UByteArray(size.toInt())
    }

    public constructor(data: UByteArray) {
        this.buffer = data
    }

    public val length: Double
        get() {
            return this.buffer.size.toDouble()
        }

    public inline operator fun get(idx: Int): Double {
        return this.buffer[idx].toDouble()
    }

    public inline operator fun get(idx: Double): Double {
        return this.buffer[idx.toInt()].toDouble()
    }

    public inline operator fun set(idx: Int, value: Double) {
        this.buffer[idx] = value.toInt().toUByte()
    }

    public inline fun set(subarray: Uint8Array, pos: Double) {
        subarray.buffer.copyInto(buffer, pos.toInt(), 0, subarray.buffer.size)
    }

    override fun iterator(): Iterator<UByte> {
        return buffer.iterator()
    }

    public fun subarray(begin: Double, end: Double): Uint8Array {
        return Uint8Array(buffer.copyOfRange(begin.toInt(), end.toInt()))
    }
}
