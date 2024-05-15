package alphaTab.core.ecmaScript

internal class Int32Array : Iterable<Int> {
    private val _data: IntArray

    public val length: Double
        get() {
            return _data.size.toDouble()
        }

    public constructor(size: Double) {
        _data = IntArray(size.toInt())
    }

    public operator fun get(index: Double): Double {
        return _data[index.toInt()].toDouble()
    }

    public operator fun get(index: Int): Double {
        return _data[index].toDouble()
    }

    public operator fun set(index: Double, value: Double) {
        _data[index.toInt()] = value.toInt()
    }

    public operator fun set(index: Int, value: Double) {
        _data[index] = value.toInt()
    }

    public operator fun set(index: Int, value: Int) {
        _data[index] = value
    }

    public fun fill(i: Int) {
        _data.fill(i)
    }

    override fun iterator(): Iterator<Int> {
        return _data.iterator()
    }

}
