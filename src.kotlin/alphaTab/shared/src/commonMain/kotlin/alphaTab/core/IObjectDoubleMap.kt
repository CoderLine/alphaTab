package alphaTab.core

public interface IObjectDoubleMap<TKey> : IMap<TKey, Double> {
}

public class ObjectDoubleMap<TValue> : IObjectDoubleMap<TValue> {
    public constructor() {
        TODO("Not yet implemented")
    }

    public constructor(entries: Iterable<Pair<TValue, Double>>) {
        TODO("Not yet implemented")
    }

    override val size: Double
        get() = TODO("Not yet implemented")

    override fun has(key: TValue): Boolean {
        TODO("Not yet implemented")
    }

    override fun get(key: TValue): Double {
        TODO("Not yet implemented")
    }

    override fun set(key: TValue, value: Double) {
        TODO("Not yet implemented")
    }

    override fun delete(key: TValue) {
        TODO("Not yet implemented")
    }

    override fun values(): Iterable<Double> {
        TODO("Not yet implemented")
    }

    override fun keys(): Iterable<TValue> {
        TODO("Not yet implemented")
    }

    override fun clear() {
        TODO("Not yet implemented")
    }

    override fun iterator(): Iterator<Pair<TValue, Double>> {
        TODO("Not yet implemented")
    }
}
