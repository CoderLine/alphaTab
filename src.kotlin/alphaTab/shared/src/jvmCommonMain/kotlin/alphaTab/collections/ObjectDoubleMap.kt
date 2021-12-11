package alphaTab.collections

import org.eclipse.collections.impl.map.mutable.primitive.ObjectDoubleHashMap

internal actual class ObjectDoubleMap<TKey> : Iterable<ObjectDoubleMapEntry<TKey>> {
    private val _data: ObjectDoubleHashMap<TKey>

    public actual val size: Double
        get() = _data.size().toDouble()

    public actual constructor() {
        _data = ObjectDoubleHashMap()
    }

    public actual constructor(items: Iterable<ObjectDoubleMapEntry<TKey>>) {
        _data = ObjectDoubleHashMap()
        for (item in items) {
            _data.put(item.key, item.value)
        }
    }

    public actual fun has(key: TKey): Boolean {
        return _data.containsKey(key)
    }

    public actual fun get(key: TKey): Double {
        return _data.get(key)
    }

    public actual fun set(key: TKey, value: Double) {
        _data.put(key, value)
    }

    public actual fun delete(key: TKey) {
        _data.removeKey(key)
    }

    public actual fun values(): IDoubleIterable {
        return EclipseDoubleIterable(_data.values())
    }

    public actual fun keys(): Iterable<TKey> {
        return _data.keysView()
    }

    public actual fun clear() {
        _data.clear()
    }

    public override fun iterator(): Iterator<ObjectDoubleMapEntry<TKey>> {
        return EclipseObjectDoubleMapIterator(_data)
    }
}

internal class EclipseObjectDoubleMapIterator<TKey>(private val _data: ObjectDoubleHashMap<TKey>) : Iterator<ObjectDoubleMapEntry<TKey>> {
    private val _keyIterator = _data.keySet().iterator()

    override fun hasNext(): Boolean {
        return _keyIterator.hasNext()
    }

    override fun next(): ObjectDoubleMapEntry<TKey> {
        val next = _keyIterator.next()
        return ObjectDoubleMapEntry(next, _data.get(next))
    }
}
