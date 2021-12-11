package alphaTab.collections

import org.eclipse.collections.impl.map.mutable.primitive.DoubleObjectHashMap

public actual class DoubleObjectMap<TValue> : Iterable<DoubleObjectMapEntry<TValue>> {
    private val _data: DoubleObjectHashMap<TValue>

    public actual val size: Double
        get() = _data.size().toDouble()

    public actual constructor() {
        _data = DoubleObjectHashMap()
    }

    public actual constructor(items: Iterable<DoubleObjectMapEntry<TValue>>) {
        _data = DoubleObjectHashMap()
        for (item in items) {
            _data.put(item.key, item.value)
        }
    }

    public actual fun has(key: Double): Boolean {
        return _data.containsKey(key)
    }

    public actual fun get(key: Double): TValue {
        return _data.get(key)
    }

    public actual fun set(key: Double, value: TValue) {
        _data.put(key, value)
    }

    public actual fun delete(key: Double) {
        _data.removeKey(key)
    }

    public actual fun values(): Iterable<TValue> {
        return _data.values()
    }

    public actual fun keys(): IDoubleIterable {
        return EclipseDoubleIterable(_data.keysView())
    }

    public actual fun clear() {
        _data.clear()
    }

    public override fun iterator(): Iterator<DoubleObjectMapEntry<TValue>> {
        return EclipseDoubleObjectMapIterator(_data)
    }
}

internal class EclipseDoubleObjectMapIterator<TValue>(private val _data: DoubleObjectHashMap<TValue>) : Iterator<DoubleObjectMapEntry<TValue>> {
    private val _keyIterator = _data.keySet().doubleIterator()

    override fun hasNext(): Boolean {
        return _keyIterator.hasNext()
    }

    override fun next(): DoubleObjectMapEntry<TValue> {
        val next = _keyIterator.next()
        return DoubleObjectMapEntry(next, _data.get(next))
    }
}

