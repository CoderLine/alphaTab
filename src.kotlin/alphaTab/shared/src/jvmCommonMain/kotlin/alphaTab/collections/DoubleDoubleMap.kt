package alphaTab.collections

import org.eclipse.collections.impl.map.mutable.primitive.DoubleDoubleHashMap

public actual class DoubleDoubleMap : Iterable<DoubleDoubleMapEntry> {
    private val _data: DoubleDoubleHashMap

    public actual val size: Double
        get() = _data.size().toDouble()

    public actual constructor() {
        _data = DoubleDoubleHashMap()
    }

    public actual constructor(items: Iterable<DoubleDoubleMapEntry>) {
        _data = DoubleDoubleHashMap()
        for (item in items) {
            _data.put(item.key, item.value)
        }
    }

    public actual fun has(key: Double): Boolean {
        return _data.containsKey(key)
    }

    public actual fun get(key: Double): Double {
        return _data.get(key)
    }

    public actual fun set(key: Double, value: Double) {
        _data.put(key, value)
    }

    public actual fun delete(key: Double) {
        _data.removeKey(key)
    }

    public actual fun values(): IDoubleIterable {
        return EclipseDoubleIterable(_data.values())
    }

    public actual fun keys(): IDoubleIterable {
        return EclipseDoubleIterable(_data.keysView())
    }

    public actual fun clear() {
        _data.clear()
    }

    public override fun iterator(): Iterator<DoubleDoubleMapEntry> {
        return EclipseDoubleDoubleMapIterator(_data)
    }
}

internal class EclipseDoubleDoubleMapIterator(private val _data: DoubleDoubleHashMap) : Iterator<DoubleDoubleMapEntry> {
    private val _keyIterator = _data.keySet().doubleIterator()

    override fun hasNext(): Boolean {
        return _keyIterator.hasNext()
    }

    override fun next(): DoubleDoubleMapEntry {
        val next = _keyIterator.next()
        return DoubleDoubleMapEntry(next, _data.get(next))
    }
}
