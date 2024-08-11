package alphaTab.visualTests

import alphaTab.Environment
import alphaTab.alphaSkia.AlphaSkiaLinux
import alphaTab.alphaSkia.AlphaSkiaMacOs
import alphaTab.alphaSkia.AlphaSkiaWindows
import kotlin.contracts.ExperimentalContracts

class VisualTestHelperPartials {
    companion object {
        @ExperimentalUnsignedTypes
        @ExperimentalContracts
        suspend fun enableAlphaSkia(bravura: alphaTab.core.ecmaScript.ArrayBuffer) {
            val os = System.getProperty("os.name") ?: "none"
            when {
                os == "Mac OS X" -> {
                    AlphaSkiaMacOs.INSTANCE.initialize()
                }

                os.startsWith("Win") -> {
                    AlphaSkiaWindows.INSTANCE.initialize()
                }

                os.startsWith("Linux") -> {
                    AlphaSkiaLinux.INSTANCE.initialize()
                }

                else -> {
                    throw Error("Unsupported OS: $os")
                }
            }

            Environment.enableAlphaSkia(
                bravura,
                null
            );
        }
    }
}
