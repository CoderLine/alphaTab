package alphaTab.core

import alphaTab.core.ecmaScript.RegExp
import kotlin.contracts.ExperimentalContracts
import kotlin.contracts.contract

internal class TypeHelper {
    companion object {
        public fun createRegex(pattern: String, flags: String): RegExp {
            return RegExp(pattern, flags)
        }

        @ExperimentalContracts
        public fun isTruthy(s: String?): Boolean {
            contract { returns(true) implies (s != null) }
            return s != null && s.isNotEmpty()
        }

        public fun isTruthy(b: Boolean?): Boolean {
            return b != null && b
        }

        @ExperimentalContracts
        public fun isTruthy(s: Any?): Boolean {
            contract { returns(true) implies (s != null) }
            return s != null
        }

        @ExperimentalUnsignedTypes
        public fun typeOf(s: Any?): String {
            return when (s) {
                is String -> "string"
                is Boolean -> "boolean"
                is Byte,
                is Short,
                is Int,
                is Long,
                is UByte,
                is UShort,
                is UInt,
                is ULong,
                is Float,
                is Double,
                is IAlphaTabEnum -> "number"
                null -> "undefined"
                else -> "object"
            }
        }

        @Suppress("NOTHING_TO_INLINE")
        public inline fun <T> setInitializer(vararg values: T): Iterable<T> {
            return values.asIterable()
        }

        @Suppress("NOTHING_TO_INLINE")
        public inline fun <T> mapInitializer(vararg values: T): Iterable<T> {
            return values.asIterable();
        }
    }
}
