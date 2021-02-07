package alphaTab.core.ecmaScript

import alphaTab.core.decodeToFloatArray

@ExperimentalUnsignedTypes
public class Float32Array : Iterable<Float> {
    private val data: FloatArray

    public val length: Double
        get() {
            return data.size.toDouble()
        }

    public constructor(size: Double) {
        data = FloatArray(size.toInt())
    }

    public constructor(x: ArrayBuffer) {
        data = x.raw.decodeToFloatArray()
    }

    internal constructor(x: FloatArray) {
        data = x
    }

    public constructor(x: List<Double>) {
        this.data = x.map { d -> d.toFloat() }.toFloatArray()
    }

    public operator fun get(idx: Int): Double {
        return data[idx].toDouble()
    }

    public operator fun set(idx: Int, value: Double) {
        data[idx] = value.toFloat()
    }

    override fun iterator(): Iterator<Float> {
        return data.iterator()
    }

    public fun set(subarray: Float32Array, pos: Double) {
        subarray.data.copyInto(data, pos.toInt(), 0, data.size)
    }

    public fun subarray(begin: Double, end: Double): Float32Array {
        return Float32Array(data.copyOfRange(begin.toInt(), end.toInt()))
    }
}
