package alphaTab.collections

internal actual class BooleanList actual constructor(vararg elements: Boolean) : IBooleanIterable {
    private val _data: BooleanArray = elements

    public actual val length: Double
        get() = _data.size.toDouble()

    public actual operator fun get(index: Int): Boolean {
        return _data[index]
    }

    public override fun iterator(): BooleanIterator {
        return _data.iterator()
    }
}
