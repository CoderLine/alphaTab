package alphaTab.collections

public interface IBooleanIterable : Iterable<Boolean> {
    public override fun iterator(): BooleanIterator
}

internal class BooleanList(vararg elements: Boolean) : IBooleanIterable {
    private val _data: BooleanArray = elements

    public val length: Double
        get() = _data.size.toDouble()

    public operator fun get(index: Int): Boolean {
        return _data[index]
    }

    public override fun iterator(): BooleanIterator {
        return _data.iterator()
    }
}
