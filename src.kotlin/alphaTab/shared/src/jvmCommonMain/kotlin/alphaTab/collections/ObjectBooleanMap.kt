package alphaTab.collections

import org.eclipse.collections.impl.map.mutable.primitive.ObjectBooleanHashMap

public actual class ObjectBooleanMap<TKey> : Iterable<ObjectBooleanMapEntry<TKey>> {
    private val _data: ObjectBooleanHashMap<TKey>

    public actual val size: Double
        get() = _data.size().toDouble()

    public actual constructor() {
        _data = ObjectBooleanHashMap()
    }

    public actual constructor(items: Iterable<ObjectBooleanMapEntry<TKey>>) {
        _data = ObjectBooleanHashMap()
        for (item in items) {
            _data.put(item.key, item.value)
        }
    }

    public actual fun has(key: TKey): Boolean {
        return _data.containsKey(key)
    }

    public actual fun get(key: TKey): Boolean {
        return _data.get(key)
    }

    public actual fun set(key: TKey, value: Boolean) {
        _data.put(key, value)
    }

    public actual fun delete(key: TKey) {
        _data.removeKey(key)
    }

    public actual fun values(): IBooleanIterable {
        return EclipseBooleanIterable(_data.values())
    }

    public actual fun keys(): Iterable<TKey> {
        return _data.keysView()
    }

    public actual fun clear() {
        _data.clear()
    }

    public override fun iterator(): Iterator<ObjectBooleanMapEntry<TKey>> {
        return EclipseObjectBooleanMapIterator(_data)
    }
}

internal class EclipseObjectBooleanMapIterator<TKey>(private val _data: ObjectBooleanHashMap<TKey>) : Iterator<ObjectBooleanMapEntry<TKey>> {
    private val _keyIterator = _data.keySet().iterator()

    override fun hasNext(): Boolean {
        return _keyIterator.hasNext()
    }

    override fun next(): ObjectBooleanMapEntry<TKey> {
        val next = _keyIterator.next()
        return ObjectBooleanMapEntry(next, _data.get(next))
    }
}
