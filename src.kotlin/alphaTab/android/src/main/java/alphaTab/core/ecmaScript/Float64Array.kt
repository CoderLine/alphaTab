package alphaTab.core.ecmaScript

import alphaTab.core.decodeToDoubleArray

@ExperimentalUnsignedTypes
internal class Float64Array : Iterable<Double> {
    private val data: DoubleArray

    public constructor(x: ArrayBuffer) {
        data = x.decodeToDoubleArray()
    }

    public operator fun get(idx: Int): Double {
        return data[idx]
    }

    override fun iterator(): Iterator<Double> {
        return data.iterator()
    }
}
