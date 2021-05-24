package alphaTab.core

public interface IDoubleBooleanMap : IMap<Double, Boolean> {
}


public class DoubleBooleanMap : IDoubleBooleanMap {
    override val size: Double
        get() = TODO("Not yet implemented")

    override fun has(key: Double): Boolean {
        TODO("Not yet implemented")
    }

    override fun get(key: Double): Boolean {
        TODO("Not yet implemented")
    }

    override fun set(key: Double, value: Boolean) {
        TODO("Not yet implemented")
    }

    override fun delete(key: Double) {
        TODO("Not yet implemented")
    }

    override fun values(): Iterable<Boolean> {
        TODO("Not yet implemented")
    }

    override fun keys(): Iterable<Double> {
        TODO("Not yet implemented")
    }

    override fun clear() {
        TODO("Not yet implemented")
    }

    override fun iterator(): Iterator<Pair<Double, Boolean>> {
        TODO("Not yet implemented")
    }

}
