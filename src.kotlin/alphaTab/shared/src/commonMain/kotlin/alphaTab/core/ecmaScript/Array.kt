package alphaTab.core.ecmaScript

class Array {
    companion object {
        public fun <T> from(x: Iterable<T>): alphaTab.collections.List<T> {
            return alphaTab.collections.List(x)
        }
        public fun isArray(x:Any?):Boolean {
            return x is MutableList<*>
        }
    }
}
