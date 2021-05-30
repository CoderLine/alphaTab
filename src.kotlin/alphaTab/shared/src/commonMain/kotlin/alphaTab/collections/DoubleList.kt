package alphaTab.collections

public interface IDoubleIterable : Iterable<Double> {
    override fun iterator(): DoubleIterator
}

public expect class DoubleList : IDoubleIterable {
    public val length: Double

    public constructor()
    public constructor(size:Int)
    public constructor(vararg elements: Double)

    public operator fun get(index: Int): Double
    public operator fun set(index: Int, value: Double)

    public fun push(item: Double)
    public fun join(separator:String): String

    public fun <TOut> map(transform: (v: Double) -> TOut): alphaTab.collections.List<TOut>
    public fun map(transform: (v: Double) -> Double): DoubleList
    public fun reverse(): DoubleList
    public fun fill(value: Double): DoubleList
    public fun slice(): DoubleList
    public fun sort()
}
