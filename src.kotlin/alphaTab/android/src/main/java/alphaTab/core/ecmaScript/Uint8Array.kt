package alphaTab.core.ecmaScript

@Suppress("NOTHING_TO_INLINE")
@ExperimentalUnsignedTypes
public class Uint8Array : Iterable<UByte> {
    public val buffer: ArrayBuffer
    public val length: Double
    public val byteOffset: Double

    internal constructor(x: Iterable<Double>) {
        this.buffer = x.map { d -> d.toInt().toUByte() }.toUByteArray()
        this.length = this.buffer.size.toDouble()
        this.byteOffset = 0.0
    }

    internal constructor(size: Double) {
        this.buffer = UByteArray(size.toInt())
        this.length = size
        this.byteOffset = 0.0
    }

    public constructor() : this(UByteArray(0)) {
    }

    public constructor(data: UByteArray) {
        this.buffer = data
        this.length = data.size.toDouble()
        this.byteOffset = 0.0
    }

    internal constructor(data: UByteArray, offset: Double = 0.0, length: Double = 0.0) {
        this.buffer = data
        this.length = length
        this.byteOffset = offset
    }

    public inline operator fun get(idx: Int): Double {
        return this.buffer[this.byteOffset.toInt() + idx].toDouble()
    }

    public inline operator fun get(idx: Double): Double {
        return this[idx.toInt()]
    }

    public inline operator fun set(idx: Int, value: Double) {
        this.buffer[this.byteOffset.toInt() + idx] = value.toInt().toUByte()
    }

    internal inline fun set(subarray: Uint8Array, pos: Double) {
        subarray.buffer.copyInto(buffer, pos.toInt(), this.byteOffset.toInt(), subarray.buffer.size)
    }

    override fun iterator(): Iterator<UByte> {
        val offset = this.byteOffset.toInt()
        return (0 until length.toInt()).map { buffer[offset + it] }.iterator()
    }

    internal fun subarray(begin: Double, end: Double): Uint8Array {
        return Uint8Array(buffer.copyOfRange((this.byteOffset + begin).toInt(), (this.byteOffset + end).toInt()))
    }

    internal fun reverse() {
        buffer.reverse(this.byteOffset.toInt(), this.byteOffset.toInt() + this.length.toInt())
    }

    internal fun slice(startByte: Double, endByte: Double): Uint8Array {
        return Uint8Array(
            this.buffer, this.byteOffset + startByte,
            endByte - startByte)
    }
}
