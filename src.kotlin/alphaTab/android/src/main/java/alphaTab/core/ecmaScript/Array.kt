package alphaTab.core.ecmaScript

import alphaTab.collections.IDoubleIterable

@Suppress("NOTHING_TO_INLINE")
internal class Array {
    companion object {
        public inline fun <T> from(x: Iterable<T>): alphaTab.collections.List<T> {
            return alphaTab.collections.List(x)
        }
        public inline fun from(x: IDoubleIterable): alphaTab.collections.DoubleList {
            return alphaTab.collections.DoubleList(x)
        }
        public inline fun isArray(x:Any?):Boolean {
            return x is alphaTab.collections.List<*>
        }
    }
}
