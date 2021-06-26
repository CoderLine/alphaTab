package alphaTab.collections

public actual class ObjectBooleanMap<TKey> : Iterable<ObjectBooleanMapEntry<TKey>> {
    public actual val size: Double
        get() = TODO("")
    
    public actual constructor() {
        TODO("")
    }
    public actual constructor(items:Iterable<ObjectBooleanMapEntry<TKey>>) {
        TODO("")
    }

    public actual fun has(key: TKey): Boolean {
        TODO("")
    }
    public actual fun get(key: TKey): Boolean {
        TODO("")
    }
    public actual fun set(key: TKey, value: Boolean) {
        TODO("")
    }
    public actual fun delete(key: TKey) {
        TODO("")
    }
    public actual fun values(): IBooleanIterable {
        TODO("")
    }
    public actual fun keys(): Iterable<TKey> {
        TODO("")
    }
    public actual fun clear() {
        TODO("")
    }
    public override fun iterator(): Iterator<ObjectBooleanMapEntry<TKey>> {
        TODO("")
    }
}
