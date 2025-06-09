package alphaTab.collections

internal class ArrayListWithRemoveRange<T> : ArrayList<T> {

    constructor() : super()
    constructor(c: Collection<T>) : super(c)

    public override fun removeRange(startIndex:Int, endIndex:Int) {
        super.removeRange(startIndex, endIndex);
    }
}

public class List<T> : Iterable<T> {
    internal val _data: ArrayListWithRemoveRange<T>

    val length: Double
        get() = _data.size.toDouble()

    public constructor() {
        _data = ArrayListWithRemoveRange()
    }

    public constructor(vararg items: T) {
        _data = items.toCollection(ArrayListWithRemoveRange())
    }

    @Suppress("UNCHECKED_CAST")
    public constructor(size: Int) {
        _data = ArrayListWithRemoveRange()
        var remaining = size
        while (remaining-- > 0) {
            _data.add(null as T)
        }
    }
    @Suppress("UNCHECKED_CAST")
    internal constructor(size: Double) : this(size.toInt())

    public constructor(items: Iterable<T>) {
        _data = items.toCollection(ArrayListWithRemoveRange())
    }

    internal constructor(items: ArrayListWithRemoveRange<T>) {
        _data = items
    }

    public override fun iterator(): Iterator<T> {
        return _data.iterator()
    }

    public fun push(item: T) {
        _data.add(item)
    }

    public fun fill(item: T) {
        _data.fill(item)
    }

    public fun push(vararg items: T) {
        _data.addAll(items)
    }

    public operator fun get(index: Int): T {
        return _data[index]
    }

    public operator fun set(index: Int, value: T) {
        _data[index] = value
    }

    public fun filter(predicate: (T) -> Boolean): List<T> {
        return List(_data.filter(predicate))
    }

    public fun some(predicate: (T) -> Boolean): Boolean {
        return _data.any(predicate)
    }

    public fun includes(value: T): Boolean {
        return _data.contains(value)
    }

    public fun indexOf(value: T): Double {
        return _data.indexOf(value).toDouble()
    }

    public fun pop(): T {
        return _data.removeAt(_data.lastIndex)
    }

    public fun unshift(item: T) {
        _data.add(0, item)
    }

    public fun sort(comparison: (a: T, b: T) -> Double): List<T> {
        _data.sortWith { a, b -> comparison(a, b).toInt() }
        return this
    }

    public fun <TOut> map(transform: (v: T) -> TOut): List<TOut> {
        return List(_data.map(transform))
    }

    public fun map(transform: (v: T) -> Double): DoubleList {
        val mapped = DoubleList(_data.size)
        _data.forEachIndexed { index, item ->
            mapped[index] = transform(item)
        }
        return mapped
    }

    @kotlin.jvm.JvmName("mapIntToDouble")
    public fun map(transform: (v: T) -> Int): DoubleList {
        val mapped = DoubleList(_data.size)
        _data.forEachIndexed { index, item ->
            mapped[index] = transform(item).toDouble()
        }
        return mapped
    }

    public fun reverse(): List<T> {
        _data.reverse()
        return this
    }

    public fun slice(): List<T> {
        return List(ArrayListWithRemoveRange(_data))
    }

    public fun slice(start: Double): List<T> {
        return List(ArrayListWithRemoveRange(_data.subList(start.toInt(), _data.size)))
    }

    public fun shift(): T {
        return _data.removeAt(0)
    }

    public fun splice(start: Double, deleteCount: Double, vararg newElements: T) {
        var actualStart = start.toInt()
        if (actualStart < 0) {
            actualStart += _data.size
        }

        _data.removeRange(start.toInt(), (start + deleteCount).toInt())
        _data.addAll(start.toInt(), newElements.toList())
    }

    public fun join(separator: String): String {
        return _data.joinToString(separator)
    }
}

internal inline fun <reified T> List<T>.toArray(): Array<T>  {
    return this._data.toTypedArray()
}
