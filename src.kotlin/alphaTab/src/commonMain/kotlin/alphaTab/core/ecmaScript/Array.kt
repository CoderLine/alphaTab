package alphaTab.core.ecmaScript

class Array {
    companion object {
        public fun <T> from(x: Iterable<T>): MutableList<T> {
            return x.toMutableList()
        }
    }
}
