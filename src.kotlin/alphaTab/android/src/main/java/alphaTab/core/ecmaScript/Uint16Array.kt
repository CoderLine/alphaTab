package alphaTab.core.ecmaScript

@Suppress("NOTHING_TO_INLINE")
@ExperimentalUnsignedTypes
internal class Uint16Array : Iterable<UShort> {
    private val _data: UShortArray

    public val length: Double
        get() {
            return _data.size.toDouble()
        }

    public constructor(size: Double) {
        _data = UShortArray(size.toInt())
    }

    public inline operator fun get(index: Double): Double {
        return _data[index.toInt()].toDouble()
    }

    public inline operator fun set(index: Double, value: Double) {
        _data[index.toInt()] = value.toInt().toUShort()
    }

    public inline operator fun get(index: Int): Double {
        return _data[index].toDouble()
    }

    public inline operator fun set(index: Int, value: Double) {
        _data[index] = value.toUInt().toUShort()
    }

    override fun iterator(): Iterator<UShort> {
        return _data.iterator()
    }
}
