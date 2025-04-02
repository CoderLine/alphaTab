package alphaTab

import alphaTab.collections.DoubleBooleanMap
import alphaTab.collections.DoubleDoubleMap
import alphaTab.collections.DoubleObjectMap
import alphaTab.collections.ObjectBooleanMap
import alphaTab.collections.ObjectDoubleMap
import alphaTab.core.ArrayTuple
import alphaTab.core.IArrayTuple

@kotlin.contracts.ExperimentalContracts
@kotlin.ExperimentalUnsignedTypes
class PrettyFormatPartials {
    companion object {
        fun mapAsUnknownIterable(map: Any?): Iterable<IArrayTuple<Any?, Any?>>  = when(map) {
            is alphaTab.collections.Map<*, *> -> map.map { ArrayTuple(it.key, it.value) }
            is DoubleBooleanMap -> map.map { ArrayTuple(it.key, it.value) }
            is DoubleDoubleMap -> map.map { ArrayTuple(it.key, it.value) }
            is DoubleObjectMap<*> -> map.map { ArrayTuple(it.key, it.value) }
            is ObjectBooleanMap<*> -> map.map { ArrayTuple(it.key, it.value) }
            is ObjectDoubleMap<*> -> map.map { ArrayTuple(it.key, it.value) }
            else -> throw ClassCastException("Invalid map type: " + map?.javaClass?.name)
        }
    }
}
