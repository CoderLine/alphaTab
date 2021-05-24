package alphaTab.core

public interface IBooleanList : IList<Boolean> {
    override fun reverse(): IBooleanList
    override fun slice(start: Double): IBooleanList
    override fun fill(value: Boolean): IBooleanList
}

public fun booleanListOf(): IBooleanList = BooleanList()
public fun booleanListOf(vararg elements: Boolean): IBooleanList = BooleanList(*elements)
public fun IBooleanList.splice(start: Double, deleteCount: Double, vararg newElements: Boolean)
{

}

public class BooleanList : IBooleanList {
    public constructor() {
        TODO("Not yet implemented")
    }

    public constructor(size: Int) {
        TODO("Not yet implemented")
    }

    public constructor(vararg elements: Boolean) {
        TODO("Not yet implemented")
    }

    override fun reverse(): IBooleanList {
        TODO("Not yet implemented")
    }

    override fun slice(start: Double): IBooleanList {
        TODO("Not yet implemented")
    }

    override fun slice(): IList<Boolean> {
        TODO("Not yet implemented")
    }

    override fun fill(value: Boolean): IBooleanList {
        TODO("Not yet implemented")
    }

    override val length: Double
        get() = TODO("Not yet implemented")

    override fun get(index: Int): Boolean {
        TODO("Not yet implemented")
    }

    override fun set(index: Int, value: Boolean) {
        TODO("Not yet implemented")
    }

    override fun indexOf(value: Boolean): Double {
        TODO("Not yet implemented")
    }

    override fun push(item: Boolean) {
        TODO("Not yet implemented")
    }

    override fun pop(): Boolean {
        TODO("Not yet implemented")
    }

    override fun sort() {
        TODO("Not yet implemented")
    }

    override fun sort(comparison: (a: Boolean, b: Boolean) -> Double) {
        TODO("Not yet implemented")
    }

    override fun filter(predicate: (Boolean) -> Boolean): IList<Boolean> {
        TODO("Not yet implemented")
    }

    override fun <TOut> map(transform: (v: Boolean) -> TOut): IList<TOut> {
        TODO("Not yet implemented")
    }

    override fun map(transform: (v: Boolean) -> Double): IDoubleList {
        TODO("Not yet implemented")
    }

    override fun splice(start: Double, deleteCount: Double, newElements: Iterable<Boolean>) {
        TODO("Not yet implemented")
    }

    override fun join(separator: String): String {
        TODO("Not yet implemented")
    }

    override fun iterator(): Iterator<Boolean> {
        TODO("Not yet implemented")
    }
}
