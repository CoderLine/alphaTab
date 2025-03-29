package alphaTab

import alphaTab.collections.IMapBase
import alphaTab.core.IArrayTuple

@kotlin.contracts.ExperimentalContracts
@kotlin.ExperimentalUnsignedTypes
class PrettyFormatPartials {
    companion object {
        fun mapAsUnknownIterable(map: IMapBase): Iterable<IArrayTuple<Any?, Any?>> {
            return map.unknownEntries().asSequence().asIterable()
        }
    }
}
