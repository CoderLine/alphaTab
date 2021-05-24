package alphaTab.core

public interface IObjectBooleanMap<TKey> : IMap<TKey, Boolean> {
}

public class ObjectBooleanMap<TKey> : IObjectBooleanMap<TKey> {
    public constructor() {
        TODO("Not yet implemented")
    }

    public constructor(entries: Iterable<Pair<TKey, Boolean>>) {
        TODO("Not yet implemented")
    }

    override val size: Double
        get() = TODO("Not yet implemented")

    override fun has(key: TKey): Boolean {
        TODO("Not yet implemented")
    }

    override fun get(key: TKey): Boolean {
        TODO("Not yet implemented")
    }

    override fun set(key: TKey, value: Boolean) {
        TODO("Not yet implemented")
    }

    override fun delete(key: TKey) {
        TODO("Not yet implemented")
    }

    override fun values(): Iterable<Boolean> {
        TODO("Not yet implemented")
    }

    override fun keys(): Iterable<TKey> {
        TODO("Not yet implemented")
    }

    override fun clear() {
        TODO("Not yet implemented")
    }

    override fun iterator(): Iterator<Pair<TKey, Boolean>> {
        TODO("Not yet implemented")
    }
}
