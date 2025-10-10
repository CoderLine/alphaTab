package alphaTab

import alphaTab.collections.BooleanList
import alphaTab.collections.DoubleList
import kotlin.contracts.ExperimentalContracts

class ScoreSerializerPluginPartials {
    companion object {
        fun _isPlatformTypeEqual(v: Any?, dv: Any?): Boolean {
            if (v is DoubleList && dv is DoubleList) {
                return v.length == dv.length
            } else if (v is BooleanList && dv is BooleanList) {

                return v.length == dv.length
            }
            throw Error("Unexpected value in serialized json " + dv?.javaClass?.name)
        }
    }
}
