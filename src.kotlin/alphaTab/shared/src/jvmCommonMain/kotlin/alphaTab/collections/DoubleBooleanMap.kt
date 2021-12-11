package alphaTab.collections

import org.eclipse.collections.impl.map.mutable.primitive.DoubleBooleanHashMap

internal actual class DoubleBooleanMap : Iterable<DoubleBooleanMapEntry> {
    private val _data: DoubleBooleanHashMap

    public actual val size: Double
        get() = _data.size().toDouble()

    public actual constructor() {
        _data = DoubleBooleanHashMap()
    }

    public actual constructor(items: Iterable<DoubleBooleanMapEntry>) {
        _data = DoubleBooleanHashMap()
        for (item in items) {
            _data.put(item.key, item.value)
        }
    }

    public actual fun has(key: Double): Boolean {
        return _data.containsKey(key)
    }

    public actual fun get(key: Double): Boolean {
        return _data.get(key)
    }

    public actual fun set(key: Double, value: Boolean) {
        _data.put(key, value)
    }

    public actual fun delete(key: Double) {
        _data.removeKey(key)
    }

    public actual fun values(): IBooleanIterable {
        return EclipseBooleanIterable(_data.values())
    }

    public actual fun keys(): IDoubleIterable {
        return EclipseDoubleIterable(_data.keysView())
    }

    public actual fun clear() {
        _data.clear()
    }

    public override fun iterator(): Iterator<DoubleBooleanMapEntry> {
        return EclipseDoubleBooleanMapIterator(_data)
    }
}

internal class EclipseDoubleBooleanMapIterator(private val _data: DoubleBooleanHashMap) : Iterator<DoubleBooleanMapEntry> {
    private val _keyIterator = _data.keySet().doubleIterator()

    override fun hasNext(): Boolean {
        return _keyIterator.hasNext()
    }

    override fun next(): DoubleBooleanMapEntry {
        val next = _keyIterator.next()
        return DoubleBooleanMapEntry(next, _data.get(next))
    }
}
