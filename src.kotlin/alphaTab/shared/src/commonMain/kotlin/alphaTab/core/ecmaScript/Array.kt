package alphaTab.core.ecmaScript

import alphaTab.core.toObjectList

class Array {
    companion object {
        public fun <T> from(x: Iterable<T>): alphaTab.core.IList<T> {
            return x.toObjectList()
        }
        public fun isArray(x:Any?):Boolean {
            return x is MutableList<*>
        }
    }
}
