package alphaTab.core

public interface IDoubleObjectMap<TValue> : IMap<Double, TValue> {
    override fun has(key: Double): Boolean
    override fun get(key: Double): TValue?
    override fun set(key: Double, value: TValue)
    override fun delete(key: Double)
    override fun values(): Iterable<TValue>
    override fun keys(): Iterable<Double>
    override fun clear()
}


public class DoubleObjectMap<TValue> : IDoubleObjectMap<TValue> {
    public constructor() {
        TODO("Not yet implemented")
    }

    public constructor(entries: Iterable<Pair<Double, TValue>>) {
        TODO("Not yet implemented")
    }

    override val size: Double
        get() = TODO("Not yet implemented")

    override fun has(key: Double): Boolean {
        TODO("Not yet implemented")
    }

    override fun get(key: Double): TValue {
        TODO("Not yet implemented")
    }

    override fun set(key: Double, value: TValue) {
        TODO("Not yet implemented")
    }

    override fun delete(key: Double) {
        TODO("Not yet implemented")
    }

    override fun values(): Iterable<TValue> {
        TODO("Not yet implemented")
    }

    override fun keys(): Iterable<Double> {
        TODO("Not yet implemented")
    }

    override fun clear() {
        TODO("Not yet implemented")
    }

    override fun iterator(): Iterator<Pair<Double, TValue>> {
        TODO("Not yet implemented")
    }
}
