package alphaTab

import alphaTab.collections.BooleanList
import alphaTab.collections.DoubleList
import alphaTab.importer.alphaTex.AlphaTexAstNode
import alphaTab.importer.alphaTex.AlphaTexDiagnostic
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

class AlphaTexAstNodePluginPartials {
    companion object {
        @ExperimentalContracts
        @ExperimentalUnsignedTypes
        fun test(arg0: Any?): Boolean {
            return arg0 is AlphaTexAstNode
        }
    }
}

class AlphaTexDiagnosticPluginPartials {
    companion object {
        @ExperimentalContracts
        @ExperimentalUnsignedTypes
        fun test(arg0: Any?): Boolean {
            return arg0 is AlphaTexDiagnostic
        }
    }
}