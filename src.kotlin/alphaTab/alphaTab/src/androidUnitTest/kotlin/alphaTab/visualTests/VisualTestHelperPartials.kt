package alphaTab.visualTests

import alphaTab.Environment
import alphaTab.alphaSkia.AlphaSkiaLinux
import alphaTab.alphaSkia.AlphaSkiaMacOs
import alphaTab.alphaSkia.AlphaSkiaWindows
import alphaTab.platform.skia.AlphaSkiaTypeface
import alphaTab.platform.skia.SkiaCanvas
import kotlin.contracts.ExperimentalContracts

actual class VisualTestHelperPartials {
    actual companion object {
        @ExperimentalUnsignedTypes
        @ExperimentalContracts
        actual suspend fun enableAlphaSkia(bravura: alphaTab.core.ecmaScript.ArrayBuffer) {
            val os = System.getProperty("os.name")
            when {
                os == "Mac OS X" -> {
                    AlphaSkiaMacOs.INSTANCE.inititalize()
                }

                os.startsWith("Win") -> {
                    AlphaSkiaWindows.INSTANCE.inititalize()
                }

                os.startsWith("Linux") -> {
                    AlphaSkiaLinux.INSTANCE.inititalize()
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
