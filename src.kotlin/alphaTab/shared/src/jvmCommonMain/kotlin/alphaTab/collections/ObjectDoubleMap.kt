package alphaTab.collections

internal actual class ObjectDoubleMap<TKey> : Iterable<ObjectDoubleMapEntry<TKey>> {
    public actual val size:Double
        get() = TODO("")

    public actual constructor() {
        TODO("")
    }
    public actual constructor(items:Iterable<ObjectDoubleMapEntry<TKey>>) {
        TODO("")
    }

    public actual fun has(key: TKey): Boolean {
        TODO("")
    }
    public actual fun get(key: TKey): Double {
        TODO("")
    }
    public actual fun set(key: TKey, value: Double) {
        TODO("")
    }
    public actual fun delete(key: TKey) {
        TODO("")
    }
    public actual fun values(): IDoubleIterable {
        TODO("")
    }
    public actual fun keys(): Iterable<TKey> {
        TODO("")
    }
    public actual fun clear() {
        TODO("")
    }
    public override fun iterator(): Iterator<ObjectDoubleMapEntry<TKey>> {
        TODO("")
    }
}
