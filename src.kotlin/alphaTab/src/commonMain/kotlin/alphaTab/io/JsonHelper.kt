package alphaTab.io

import alphaTab.AlphaTabError
import alphaTab.AlphaTabErrorType
import alphaTab.core.IAlphaTabEnum
import kotlin.contracts.ExperimentalContracts
import kotlin.reflect.KClass

internal open class JsonHelperPartials {
    companion object {
        public fun forEach(o: Any?, func: (v: Any?, k: String) -> Boolean) {
            if (o is Map<*, *>) {
                for (kvp in o) {
                    func(kvp.value, (kvp.key!!) as String);
                }
            }
        }
        public fun forEach(o: Any?, func: (v: Any?, k: String) -> Unit) {
            if (o is Map<*, *>) {
                for (kvp in o) {
                    func(kvp.value, (kvp.key!!) as String);
                }
            }
        }

        @ExperimentalContracts
        public inline fun <reified T : kotlin.Enum<T>> parseEnum(value: Any?, type: KClass<T>): T? {
            if (value == null) {
                return null;
            }
            if (value is String) {
                for (e in enumValues<T>()) {
                    if (e.name.toLowerCase() == value) {
                        return e
                    }
                }
                return null;
            }
            if (value is Int) {
                for (e in enumValues<T>()) {
                    if (e is alphaTab.core.IAlphaTabEnum && e.value == value) {
                        return e
                    }
                }
                return null;
            }
            if (value is T) {
                return value;
            }
            throw AlphaTabError(
                AlphaTabErrorType.Format,
                "Could not parse enum value '$value' [(${value::class.simpleName}"
            )
        }
    }
}
