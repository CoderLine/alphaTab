package alphaTab.importer.alphaTex

import alphaTab.core.IAlphaTabEnum
import alphaTab.core.IAlphaTabEnumCompanion

internal class AlphaTex1EnumMappingsPartials {
    companion object {
        val enumFactory = HashMap<kotlin.reflect.KClass<*>, (v: Double) -> IAlphaTabEnum>()

        fun <T> _toEnum(type: Any?, value: Double): T
            where T : IAlphaTabEnum {

            val clz = type as kotlin.reflect.KClass<*>
            val factory = enumFactory.getOrPut(clz, {

                val companionField = clz.java.declaredFields.find { it.name === "Companion" }
                if (companionField == null) {
                    throw IllegalArgumentException("Provided class has no companion object")
                }

                val companion = companionField.get(null) as IAlphaTabEnumCompanion<*>
                val factory: (v: Double) -> IAlphaTabEnum = { v ->
                    companion.fromValue(v) as IAlphaTabEnum
                }
                factory
            })

            @Suppress("UNCHECKED_CAST")
            return factory(value) as T
        }
    }
}
