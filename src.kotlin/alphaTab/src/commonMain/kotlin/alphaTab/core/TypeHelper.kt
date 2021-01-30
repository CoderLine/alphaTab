package alphaTab.core

import kotlin.contracts.ExperimentalContracts
import kotlin.contracts.contract

class TypeHelper {
    companion object {
        public fun isTruthy(s: String?): Boolean {
            return s != null && s.isNotEmpty();
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
