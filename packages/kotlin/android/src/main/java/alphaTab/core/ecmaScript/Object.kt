package alphaTab.core.ecmaScript

import alphaTab.collections.List
import alphaTab.core.ArrayTuple
import alphaTab.core.IAlphaTabEnum
import kotlin.reflect.KClass

internal class Object {
    companion object {
        fun <TKey, TValue> entries(record: alphaTab.core.ecmaScript.Record<TKey, TValue>): List<ArrayTuple<TKey, TValue>> {
            return List(record.map {
                ArrayTuple(it.key, it.value)
            })
        }

        inline fun <reified T : Enum<T>> values( @Suppress("UNUSED_PARAMETER")  type: KClass<T>): List<Any> {
            return List(*enumValues<T>()).map<Any> { v ->
                (v as IAlphaTabEnum).value.toDouble()
            }
        }
    }
}
