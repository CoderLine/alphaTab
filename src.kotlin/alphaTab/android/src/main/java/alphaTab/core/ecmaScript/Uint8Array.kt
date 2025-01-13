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

    internal fun subarray(begin: Double, end: Double): Uint8Array {
        return Uint8Array(buffer.copyOfRange(begin.toInt(), end.toInt()))
    }

    internal fun reverse() {
        buffer.reverse()
    }

    internal fun slice(startByte: Double, endByte: Double): Uint8Array {
        return Uint8Array(
            this.buffer, this.byteOffset + startByte,
            endByte - startByte)
    }
}
