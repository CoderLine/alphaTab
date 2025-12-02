package alphaTab.core.ecmaScript

import alphaTab.collections.ObjectBooleanMap

public class Set<T> : Iterable<T> {
    private val _storage: ObjectBooleanMap<T>

    public constructor() {
        _storage = ObjectBooleanMap()
    }

    public val size: Double
        get() = _storage.size.toDouble()

    public constructor(values: Iterable<T>?) {
        _storage = ObjectBooleanMap()
        if (values != null) {
            for (v in values) {
                add(v)
            }
        }
    }

    public fun add(item: T) {
        _storage.set(item, true)
    }

    public fun has(item: T): Boolean {
        return _storage.has(item)
    }

    public fun delete(item: T) {
        _storage.delete(item)
    }

    public fun forEach(action: (item: T) -> Unit) {
        for (i in _storage.keys()) {
            action(i)
        }
    }

    override fun iterator(): Iterator<T> {
        return _storage.keys().iterator()
    }

    fun clear() {
        _storage.clear()
    }
}
