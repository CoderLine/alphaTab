package alphaTab.core.ecmaScript

import alphaTab.collections.List
import alphaTab.core.ArrayTuple
import alphaTab.core.IAlphaTabEnum
import alphaTab.core.IAlphaTabEnumCompanion
import alphaTab.core.IArrayTuple
import alphaTab.core.substr
import alphaTab.core.toDouble
import kotlin.reflect.KClass

internal class Object {
    companion object {
        val objectEntriesCache = HashMap<Class<*>, HashMap<String, ((o: Any) -> Any?)>>()

        fun getObjectEntriesCache(t: Class<*>): HashMap<String, ((o: Any) -> Any?)> {
            return objectEntriesCache.getOrPut(
                t
            ) {
                val props = t.methods

                val dict = HashMap<String, ((o: Any) -> Any?)>()
                for (p in props) {
                    val modifiers = p.modifiers
                    if (java.lang.reflect.Modifier.isPublic(modifiers) &&
                        !java.lang.reflect.Modifier.isStatic(modifiers) &&
                        p.name.startsWith("get") &&
                        p.parameterCount == 0
                    ) {
                        var name = p.name.substring(3, 1).lowercase()
                        if (p.name.length > 4) {
                            name += p.name.substring(4)
                        }

                        dict.put(name) {
                            p.invoke(it)
                        }
                    }
                }

                dict
            }
        }

        fun <TKey, TValue> entries(v: Record<TKey, TValue>): List<IArrayTuple<String, TValue>> {
            val entries = List<IArrayTuple<String, Any>>()

            for (item in v) {
                val value = item.value as Any?
                if (value != null) {
                    entries.push(ArrayTuple(item.key.toString(), value))
                }
            }

            @Suppress("UNCHECKED_CAST")
            return entries as List<IArrayTuple<String, TValue>>
        }

        val enumCompanion = HashMap<kotlin.reflect.KClass<*>, IAlphaTabEnumCompanion<*>?>()


        fun entries(v: Any?): List<IArrayTuple<String, Any>> {
            val entries = List<IArrayTuple<String, Any>>()
            if (v == null) return entries


            if (v is KClass<*>) {
                val comp = enumCompanion.getOrPut(v, {
                    val companionField = v.java.declaredFields.find { it.name === "Companion" }
                    companionField?.get(null) as? IAlphaTabEnumCompanion<*>
                })
                if (comp != null) {
                    for (v in comp.values) {
                        entries.push(
                            ArrayTuple(
                                (v as IAlphaTabEnum).toString(),
                                v.value.toDouble()
                            )
                        )
                    }
                }
                return entries
            }


            val factory = getObjectEntriesCache(v.javaClass)

            for (item in factory) {
                val value = item.value(v)
                if (value != null) {
                    entries.push(ArrayTuple(item.key, value))
                }
            }

            return entries
        }

        inline fun <reified T : Enum<T>> values(@Suppress("UNUSED_PARAMETER") type: KClass<T>): List<Any> {
            return List(*enumValues<T>()).map<Any> { v ->
                (v as IAlphaTabEnum).value.toDouble()
            }
        }
    }
}
