package alphaTab.core.ecmaScript

import alphaTab.core.decodeToDoubleArray

public class Float64Array: Iterable<Double> {
    private val data:DoubleArray;
    public constructor(x:ArrayBuffer) {
        data = x.raw.decodeToDoubleArray()
    }
    public constructor(x:List<Double>) {
        this.data = x.toDoubleArray()
    }

    public operator fun get(idx:Int): Double {
        return data[idx]
    }

    override fun iterator(): Iterator<Double> {
        return data.iterator();
    }
}
