package alphaTab.core

public interface IList<T> : Iterable<T> {
    val length: Double

    operator fun get(index: Int): T
    operator fun set(index: Int, value: T)

    fun indexOf(value: T): Double
    fun push(item: T)
    fun pop(): T

    fun sort(comparison: (a: T, b: T) -> Double)

    fun filter(predicate: (T) -> Boolean): IList<T>
    fun <TOut> map(transform: (v: T) -> TOut): IList<TOut>
    fun map(transform: (v: T) -> Double): IDoubleList

    fun reverse(): IList<T>
    fun fill(value: T): IList<T>

    fun slice(): IList<T>
    fun slice(start: Double): IList<T>
    fun splice(start: Double, deleteCount: Double)
    fun splice(start: Double, deleteCount: Double, newElements: kotlin.collections.List<T>)

    fun join(separator: String): String
}

public fun <T> Iterable<T>.toObjectList(): IList<T> {
    return List(this)
}

public fun <T> objectListOf(): IList<T> = List()
public fun <T> objectListOf(vararg elements: T): IList<T> = List(*elements)
public fun <T> IList<T>.splice(start: Double, deleteCount: Double, vararg newElements: T) {
    this.splice(start, deleteCount, newElements.asList());
}

public class List<T> : IList<T> {
    private val _data: MutableList<T>

    public constructor() {
        _data = ArrayList()
    }

    public constructor(size: Int) {
        @Suppress("UNCHECKED_CAST")
        _data = arrayOfNulls<Any>(size).toList() as MutableList<T>
    }

    public constructor(vararg elements: T) {
        _data = elements.toMutableList()
    }

    public constructor(elements: Iterable<T>) {
        _data = elements.toMutableList()
    }

    override val length: Double
        get() = _data.size.toDouble()

    override fun get(index: Int): T = _data[index]

    override fun set(index: Int, value: T) {
        _data[index] = value
    }

    override fun indexOf(value: T): Double = _data.indexOf(value).toDouble()
    override fun push(item: T) {
        _data.add(item)
    }

    override fun pop(): T = _data.removeLast()

    override fun sort(comparison: (a: T, b: T) -> Double) {
        _data.sortWith { a, b -> comparison(a, b).toInt() }
    }

    override fun filter(predicate: (T) -> Boolean): IList<T> {
        return List(_data.filter(predicate))
    }

    override fun <TOut> map(transform: (v: T) -> TOut): IList<TOut> {
        return List(_data.map(transform))
    }

    override fun map(transform: (v: T) -> Double): IDoubleList {
        return DoubleList(_data.map(transform))
    }

    override fun reverse(): IList<T> {
        _data.reverse()
        return this
    }

    override fun fill(value: T): IList<T> {
        _data.fill(value)
        return this
    }

    override fun slice(): IList<T> {
        return List(_data)
    }

    override fun slice(start: Double): IList<T> {
        return List(_data.subList(start.toInt(), _data.size))
    }

    override fun join(separator: String): String {
        return _data.joinToString(separator)
    }

    override fun iterator(): Iterator<T> {
        return _data.iterator()
    }

    override fun splice(start: Double, deleteCount: Double) {
        if (deleteCount > 0) {
            _data.removeAll(_data.subList(start.toInt(), (start + deleteCount).toInt()))
        }
    }

    override fun splice(
        start: Double,
        deleteCount: Double,
        newElements: kotlin.collections.List<T>
    ) {
        if (deleteCount > 0) {
            _data.removeAll(_data.subList(start.toInt(), (start + deleteCount).toInt()))
        }
        _data.addAll(start.toInt(), newElements)
    }

}
