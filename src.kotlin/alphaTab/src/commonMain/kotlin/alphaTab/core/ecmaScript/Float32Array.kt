package alphaTab.core.ecmaScript

import alphaTab.core.decodeToFloatArray

public class Float32Array: Iterable<Float> {
    private val data:FloatArray;
    public constructor(x:ArrayBuffer) {
        data = x.raw.decodeToFloatArray()
    }
    public constructor(x:List<Double>) {
        this.data = x.map { d -> d.toFloat() }.toFloatArray()
    }

    public operator fun get(idx:Int): Double {
        return data[idx].toDouble()
    }

    override fun iterator(): Iterator<Float> {
        return data.iterator();
    }
}
