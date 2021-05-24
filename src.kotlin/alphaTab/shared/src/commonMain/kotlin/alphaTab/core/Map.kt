package alphaTab.core

public interface IMap<TKey, TValue> : Iterable<Pair<TKey, TValue>> {
    val size: Double
    fun has(key: TKey): Boolean
    fun get(key: TKey): TValue
    fun set(key: TKey, value: TValue)
    fun delete(key: TKey)
    fun values(): Iterable<TValue>
    fun keys(): Iterable<TKey>
    fun clear()
}

public class Map<TKey, TValue> : IMap<TKey, TValue> {
    public constructor() {
        TODO("Not yet implemented")
    }

    public constructor(entries: Iterable<Pair<TKey, TValue>>) {
        TODO("Not yet implemented")
    }

    override val size: Double
        get() = TODO("Not yet implemented")

    override fun has(key: TKey): Boolean {
        TODO("Not yet implemented")
    }

    override fun get(key: TKey): TValue {
        TODO("Not yet implemented")
    }

    override fun set(key: TKey, value: TValue) {
        TODO("Not yet implemented")
    }

    override fun delete(key: TKey) {
        TODO("Not yet implemented")
    }

    override fun values(): Iterable<TValue> {
        TODO("Not yet implemented")
    }

    override fun keys(): Iterable<TKey> {
        TODO("Not yet implemented")
    }

    override fun clear() {
        TODO("Not yet implemented")
    }

    override fun iterator(): Iterator<Pair<TKey, TValue>> {
        TODO("Not yet implemented")
    }
}
