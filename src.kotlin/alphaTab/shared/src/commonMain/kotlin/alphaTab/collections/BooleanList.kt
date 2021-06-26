package alphaTab.collections

public interface IBooleanIterable : Iterable<Boolean> {
    public override fun iterator(): BooleanIterator
}

internal expect class BooleanList(vararg elements: Boolean) : IBooleanIterable {
    public val length:Double
    public operator fun get(index: Int): Boolean
}
