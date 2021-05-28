package alphaTab.core

public interface IDoubleDoubleMap : IMap<Double, Double> {

}

public class DoubleDoubleMap : IDoubleDoubleMap {
    override val size: Double
        get() = TODO("Not yet implemented")

    override fun has(key: Double): Boolean {
        TODO("Not yet implemented")
    }

    override fun get(key: Double): Double {
        TODO("Not yet implemented")
    }

    override fun set(key: Double, value: Double) {
        TODO("Not yet implemented")
    }

    override fun delete(key: Double) {
        TODO("Not yet implemented")
    }

    override fun values(): Iterable<Double> {
        TODO("Not yet implemented")
    }

    override fun keys(): Iterable<Double> {
        TODO("Not yet implemented")
    }

    override fun clear() {
        TODO("Not yet implemented")
    }

    override fun iterator(): Iterator<Pair<Double, Double>> {
        TODO("Not yet implemented")
    }

}
