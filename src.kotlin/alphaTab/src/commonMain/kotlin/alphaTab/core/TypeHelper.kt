package alphaTab.core

import kotlin.contracts.ExperimentalContracts
import kotlin.contracts.contract

class TypeHelper {
    companion object {
        public fun isTruthy(s:String?): Boolean {
            return s != null && s.isNotEmpty();
        }
        public fun isTruthy(s:Any?): Boolean {
            return s != null;
        }
        @ExperimentalContracts
        public fun typeOf(s:Any?): String {
            contract {
                returnsNotNull() implies (s != null)
            }
            return ""
        }
    }
}
