package alphaTab.collections

public actual class DoubleList : IDoubleIterable {
    public actual val length: Double
        get() = TODO("")

    public actual constructor() {
        TODO("")
    }
    public actual constructor(size:Int) {
        TODO("")
    }
    public actual constructor(vararg elements: Double) {
        TODO("")
    }

    public operator actual fun get(index: Int): Double {
        TODO("")
    }
    public operator actual fun set(index: Int, value: Double) {
        TODO("")
    }

    public actual fun push(item: Double) {
        TODO("")
    }
    public actual fun join(separator:String): String {
        TODO("")
    }

    public actual fun <TOut> map(transform: (v: Double) -> TOut): alphaTab.collections.List<TOut> {
        TODO("")
    }
    public actual fun map(transform: (v: Double) -> Double): DoubleList {
        TODO("")
    }
    public actual fun reverse(): DoubleList {
        TODO("")
    }
    public actual fun fill(value: Double): DoubleList {
        TODO("")
    }
    public actual fun slice(): DoubleList {
        TODO("")
    }
    public actual fun sort() {
        TODO("")
    }
    
    public override fun iterator(): DoubleIterator {
        TODO("")
    }
}

