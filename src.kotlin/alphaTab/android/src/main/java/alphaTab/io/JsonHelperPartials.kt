package alphaTab.io

import alphaTab.AlphaTabError
import alphaTab.AlphaTabErrorType
import alphaTab.collections.Map
import alphaTab.core.toIntOrNaN
import kotlin.contracts.ExperimentalContracts
import kotlin.jvm.JvmName
import kotlin.reflect.KClass

internal open class JsonHelperPartials {
    companion object {
        @JvmName("forEachBool")
        public fun forEach(o: Any?, func: (v: Any?, k: String) -> Boolean) {
            if (o is Map<*, *>) {
                for (kvp in o) {
                    func(kvp.value, (kvp.key!!) as String)
                }
            }
        }

        public fun forEach(o: Any?, func: (v: Any?, k: String) -> Unit) {
            if (o is Map<*, *>) {
                for (kvp in o) {
                    func(kvp.value, (kvp.key!!) as String)
                }
            }
        }

        public fun getValue(o: Any?, k: String): Any? {
            if (o is Map<*, *>) {
                // NOTE: We know that we only have Map<String, Any?> in our serialization
                // handling. we need this cast to satisfy Kotlin type checks.
                @Suppress("UNCHECKED_CAST") val unsafeMap = o as Map<String, Any?>
                return if (unsafeMap.has(k)) unsafeMap.get(k) else null
            }

            return null
        }


        public fun <T : Enum<T>> parseEnum(value: String, values: Array<T>): T? {
            val valueInt = value.toIntOrNaN()
            val isNaN = valueInt.isNaN()
            val valueLower = value.lowercase()
            for (e in values) {
                if (valueLower.equals(e.name, true) ||
                    (!isNaN && e is alphaTab.core.IAlphaTabEnum && e.value == valueInt.toInt())
                ) {
                    return e
                }
            }
            return null
        }

        public fun <T : Enum<T>> parseEnum(value: Int, values: Array<T>): T? {
            for (e in values) {
                if (e is alphaTab.core.IAlphaTabEnum && e.value == value) {
                    return e
                }
            }
            return null
        }

        @ExperimentalUnsignedTypes
        @ExperimentalContracts
        public inline fun <reified T : Enum<T>> parseEnum(
            value: Any?,
            @Suppress("UNUSED_PARAMETER") type: KClass<T>
        ): T? {
            return when (value) {
                null -> null
                is T -> value
                is String -> parseEnum(value, enumValues<T>())
                is Double -> parseEnum(value.toInt(), enumValues<T>())
                is Int -> parseEnum(value, enumValues<T>())
                else -> throw AlphaTabError(
                    AlphaTabErrorType.Format,
                    "Could not parse enum value '$value' [(${value::class.simpleName}"
                )
            }
        }
    }
}
