package alphaTab.core

public interface IDoubleList : IList<Double> {
    override fun reverse(): IDoubleList
    override fun slice(start: Double): IDoubleList
    override fun fill(value: Double): IDoubleList
}

public fun doubleListOf(): IDoubleList = DoubleList()
public fun doubleListOf(vararg elements: Double): IDoubleList = DoubleList(*elements)
public fun IDoubleList.splice(start: Double, deleteCount: Double, vararg newElements: Double)
{

}
public class DoubleList : IDoubleList {
    public constructor() {
        TODO("Not yet implemented")
    }

    public constructor(size: Int) {
        TODO("Not yet implemented")
    }

    public constructor(vararg elements: Double) {
        TODO("Not yet implemented")
    }

    override fun reverse(): IDoubleList {
        TODO("Not yet implemented")
    }

    override fun slice(start: Double): IDoubleList {
        TODO("Not yet implemented")
    }

    override fun slice(): IList<Double> {
        TODO("Not yet implemented")
    }

    override fun fill(value: Double): IDoubleList {
        TODO("Not yet implemented")
    }

    override val length: Double
        get() = TODO("Not yet implemented")

    override fun get(index: Int): Double {
        TODO("Not yet implemented")
    }

    override fun set(index: Int, value: Double) {
        TODO("Not yet implemented")
    }

    override fun indexOf(value: Double): Double {
        TODO("Not yet implemented")
    }

    override fun push(item: Double) {
        TODO("Not yet implemented")
    }

    override fun pop(): Double {
        TODO("Not yet implemented")
    }

    override fun sort() {
        TODO("Not yet implemented")
    }

    override fun sort(comparison: (a: Double, b: Double) -> Double) {
        TODO("Not yet implemented")
    }

    override fun filter(predicate: (Double) -> Boolean): IList<Double> {
        TODO("Not yet implemented")
    }

    override fun <TOut> map(transform: (v: Double) -> TOut): IList<TOut> {
        TODO("Not yet implemented")
    }

    override fun map(transform: (v: Double) -> Double): IDoubleList {
        TODO("Not yet implemented")
    }

    override fun splice(start: Double, deleteCount: Double, newElements: Iterable<Double>) {
        TODO("Not yet implemented")
    }

    override fun join(separator: String): String {
        TODO("Not yet implemented")
    }

    override fun iterator(): Iterator<Double> {
        TODO("Not yet implemented")
    }
}
