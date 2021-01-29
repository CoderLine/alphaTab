package alphaTab.core.ecmaScript

public class Float32Array: Iterable<Float> {
    private val data:FloatArray;
    public constructor(x:List<Double>) {
        this.data = x.map { d -> d.toFloat() }.toFloatArray()
    }

    public operator fun get(idx:Int): Float {
        return data[idx]
    }

    override fun iterator(): Iterator<Float> {
        return data.iterator();
    }
}
