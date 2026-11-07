package alphaTab.collections

class SimpleIterable<T>(vararg items: T) : Iterable<T> {
    private val _items = items
    override fun iterator(): Iterator<T> {
        return _items.iterator()
    }
}
