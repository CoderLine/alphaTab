package alphaTab.core

import alphaTab.core.ecmaScript.RegExp
import kotlin.contracts.ExperimentalContracts
import kotlin.contracts.contract

class TypeHelper {
    companion object {
        public inline fun createRegex(pattern:String, flags:String):RegExp {
            return RegExp(pattern, flags)
        }
        public fun isTruthy(s: String?): Boolean {
            return s != null && s.isNotEmpty();
        }
        public fun isTruthy(b: Boolean?): Boolean {
            return b != null && b;
        }

        @ExperimentalContracts
        public inline fun isTruthy(s: Any?): Boolean {
            contract { returns(true) implies (s != null) }
            return s != null;
        }

        public fun typeOf(s: Any?): String {
            return ""
        }

        public fun <K, V> createMapEntry(k: K, v: V): Pair<K, V> {
            return Pair(k, v);
        }
    }
}
