package alphaTab.visualTests

import alphaTab.Environment
import kotlin.contracts.ExperimentalContracts

@ExperimentalContracts
actual class VisualTestHelperPartials {

    actual companion object {
        actual suspend fun enableAlphaSkia(bravura: alphaTab.core.ecmaScript.ArrayBuffer) {
            Environment.enableAlphaSkia(
                bravura,
                null
            )
        }
    }
}
