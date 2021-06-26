package alphaTab.collections

public class List<T> : Iterable<T> {
    private val _data: MutableList<T>

    val length: Double
        get() = _data.size.toDouble()

    public constructor() {
        _data = ArrayList()
    }

    public constructor(vararg items: T) {
        _data = items.toMutableList()
    }

    public constructor(size:Int) {
        _data = ArrayList()
    }

    public constructor(items: Iterable<T>) {
        _data = items.toMutableList()
    }

    private constructor(items: MutableList<T>) {
        _data = items
    }

    public override fun iterator(): Iterator<T> {
        return _data.iterator()
    }

    public fun push(item: T) {
        _data.add(item)
    }

    public operator fun get(index: Int): T {
        return _data[index]
    }

    public operator fun set(index: Int, value: T) {
        _data[index] = value
    }

    public fun filter(predicate: (T) -> Boolean): List<T> {
        return List(_data.filter(predicate).toMutableList())
    }

    public fun indexOf(value: T): Double {
        TODO("")
    }
    
    public fun pop(): T {
        TODO("")
    }

    public fun sort(comparison: (a: T, b: T) -> Double) {
        TODO("")
    }    
    
    public fun <TOut> map(transform: (v: T) -> TOut): List<TOut> {
        TODO("")
    }
    
    public fun map(transform: (v: T) -> Double): DoubleList {
        TODO("")
    }
    
    public fun reverse(): List<T> {
        TODO("")
    }
    
    public fun slice(): List<T> {
        TODO("")
    }
    
    public fun slice(start: Double): List<T> {
        return this
    }
    
    public fun splice(start: Double, deleteCount: Double, vararg newElements: T) {
    }

    public fun join(separator: String): String {
        return ""
    }
}
