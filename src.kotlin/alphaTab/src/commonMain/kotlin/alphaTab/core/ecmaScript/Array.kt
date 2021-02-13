package alphaTab.core.ecmaScript

class Array {
    companion object {
        public fun <T> from(x: Iterable<T>): MutableList<T> {
            return x.toMutableList()
        }
        public fun isArray(x:Any?):Boolean {
            return x is MutableList<*>
        }
    }
}
