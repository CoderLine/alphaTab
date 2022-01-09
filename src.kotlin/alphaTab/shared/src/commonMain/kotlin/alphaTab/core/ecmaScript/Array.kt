package alphaTab.core.ecmaScript

@Suppress("NOTHING_TO_INLINE")
internal class Array {
    companion object {
        public inline fun <T> from(x: Iterable<T>): alphaTab.collections.List<T> {
            return alphaTab.collections.List(x)
        }
        public inline fun isArray(x:Any?):Boolean {
            return x is alphaTab.collections.List<*>
        }
    }
}
