package alphaTab.core

public interface IList<T> : Iterable<T> {
    val length: Double

    operator fun get(index: Int): T
    operator fun set(index: Int, value: T)

    fun indexOf(value: T): Double
    fun push(item: T)
    fun pop(): T

    fun sort()
    fun sort(comparison: (a: T, b: T) -> Double)

    fun filter(predicate: (T) -> Boolean): IList<T>
    fun <TOut> map(transform: (v: T) -> TOut): IList<TOut>
    fun map(transform: (v: T) -> Double): IDoubleList

    fun reverse(): IList<T>
    fun fill(value: T): IList<T>

    fun slice(): IList<T>
    fun slice(start: Double): IList<T>
    fun splice(start: Double, deleteCount: Double, newElements: Iterable<T>)

    fun join(separator: String): String
}

public fun <T> Iterable<T>.toObjectList(): IList<T> {
    return List(this)
}
public fun <T> objectListOf(): IList<T> = List()
public fun <T> objectListOf(vararg elements: T): IList<T> = List(*elements)
public fun <T> IList<T>.splice(start: Double, deleteCount: Double, vararg newElements: T)
{

}

public class List<T> : IList<T> {
    public constructor() {
        TODO("Not yet implemented")
    }

    public constructor(size: Int) {
        TODO("Not yet implemented")
    }

    public constructor(vararg elements: T) {
        TODO("Not yet implemented")
    }

    public constructor(elements: Iterable<T>) {
        TODO("Not yet implemented")
    }

    override val length: Double
        get() = TODO("Not yet implemented")

    override fun get(index: Int): T {
        TODO("Not yet implemented")
    }

    override fun set(index: Int, value: T) {
        TODO("Not yet implemented")
    }

    override fun indexOf(value: T): Double {
        TODO("Not yet implemented")
    }

    override fun push(item: T) {
        TODO("Not yet implemented")
    }

    override fun pop(): T {
        TODO("Not yet implemented")
    }

    override fun sort() {
        TODO("Not yet implemented")
    }

    override fun sort(comparison: (a: T, b: T) -> Double) {
        TODO("Not yet implemented")
    }

    override fun filter(predicate: (T) -> Boolean): IList<T> {
        TODO("Not yet implemented")
    }

    override fun <TOut> map(transform: (v: T) -> TOut): IList<TOut> {
        TODO("Not yet implemented")
    }

    override fun map(transform: (v: T) -> Double): IDoubleList {
        TODO("Not yet implemented")
    }

    override fun reverse(): IList<T> {
        TODO("Not yet implemented")
    }

    override fun fill(value: T): IList<T> {
        TODO("Not yet implemented")
    }

    override fun slice(): IList<T> {
        TODO("Not yet implemented")
    }

    override fun slice(start: Double): IList<T> {
        TODO("Not yet implemented")
    }

    override fun join(separator: String): String {
        TODO("Not yet implemented")
    }

    override fun iterator(): Iterator<T> {
        TODO("Not yet implemented")
    }

    override fun splice(start: Double, deleteCount: Double, newElements: Iterable<T>) {
        TODO("Not yet implemented")
    }
}
