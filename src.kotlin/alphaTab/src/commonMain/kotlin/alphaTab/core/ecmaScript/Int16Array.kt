package alphaTab.core.ecmaScript

class Int16Array : Iterable<Short> {
    private val _data: ShortArray

    public val length: Double
        get() {
            return _data.size.toDouble()
        }

    public constructor(size: Double) {
        _data = ShortArray(size.toInt())
    }

    public operator fun get(index: Double): Double {
        return _data[index.toInt()].toDouble()
    }

    public operator fun set(index: Double, value: Double) {
        _data[index.toInt()] = value.toInt().toShort()
    }

    public operator fun get(index: Int): Double {
        return _data[index].toDouble()
    }

    public operator fun set(index: Int, value: Double) {
        _data[index] = value.toInt().toShort()
    }

    override fun iterator(): Iterator<Short> {
        return _data.iterator()
    }
}
