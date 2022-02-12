package alphaTab.core.ecmaScript

@ExperimentalUnsignedTypes
internal class Uint32Array : Iterable<UInt> {
    private val _data: UIntArray

    public val length: Double
        get() {
            return _data.size.toDouble()
        }

    public constructor(size: Double) {
        _data = UIntArray(size.toInt())
    }

    public operator fun get(index: Double): Double {
        return _data[index.toInt()].toDouble()
    }

    public operator fun set(index: Double, value: Double) {
        _data[index.toInt()] = value.toInt().toUInt()
    }

    public operator fun get(index: Int): Double {
        return _data[index].toDouble()
    }

    public operator fun set(index: Int, value: Double) {
        _data[index] = value.toInt().toUInt()
    }

    public fun fill(i: UInt) {
        _data.fill(i)
    }

    override fun iterator(): Iterator<UInt> {
        return _data.iterator()
    }

}
