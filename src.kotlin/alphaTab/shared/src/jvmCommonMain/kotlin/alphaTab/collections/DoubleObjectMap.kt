package alphaTab.collections

public actual class DoubleObjectMap<TValue> : Iterable<DoubleObjectMapEntry<TValue>> {
    public actual val size:Double
        get() = TODO("")

    public actual constructor() {
        TODO("")
    }
    public actual constructor(items: Iterable<DoubleObjectMapEntry<TValue>>) {
        TODO("")
    }

    public actual fun has(key: Double): Boolean {
        TODO("")
    }
    public actual fun get(key: Double): TValue {
        TODO("")
    }
    public actual fun set(key: Double, value: TValue) {
        TODO("")
    }
    public actual fun delete(key: Double) {
        TODO("")
    }
    public actual fun values(): Iterable<TValue> {
        TODO("")
    }
    public actual fun keys(): IDoubleIterable {
        TODO("")
    }
    public actual fun clear() {
        TODO("")
    }
    public override fun iterator(): Iterator<DoubleObjectMapEntry<TValue>> {
        TODO("")
    }
}
