package alphaTab.core.ecmaScript

import alphaTab.core.decodeToFloatArray

@Suppress("NOTHING_TO_INLINE")
@ExperimentalUnsignedTypes
public class Float32Array : Iterable<Float> {
    public val data: FloatArray

    public inline val length: Double
        get() {
            return data.size.toDouble()
        }

    public constructor(size: Double) {
        data = FloatArray(size.toInt())
    }

    public constructor(x: ArrayBuffer) {
        data = x.decodeToFloatArray()
    }

    internal constructor(x: FloatArray) {
        data = x
    }

    public constructor(x: Iterable<Double>) {
        this.data = x.map { d -> d.toFloat() }.toFloatArray()
    }

    public inline operator fun get(idx: Int): Double {
        return data[idx].toDouble()
    }

    public inline operator fun set(idx: Int, value: Double) {
        data[idx] = value.toFloat()
    }

    override fun iterator(): Iterator<Float> {
        return data.iterator()
    }

    public inline fun set(subarray: Float32Array, pos: Double) {
        subarray.data.copyInto(data, pos.toInt(), 0, subarray.data.size)
    }

    public fun subarray(begin: Double, end: Double): Float32Array {
        return Float32Array(data.copyOfRange(begin.toInt(), end.toInt()))
    }
}
