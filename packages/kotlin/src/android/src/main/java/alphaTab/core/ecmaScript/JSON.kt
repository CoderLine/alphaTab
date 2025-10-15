package alphaTab.core.ecmaScript

import alphaTab.platform.Json
import kotlin.contracts.ExperimentalContracts

internal class JSON {
    companion object {
        @ExperimentalContracts
        @ExperimentalUnsignedTypes
        fun stringify(v: String) = Json.quoteJsonString(v)
    }
}
