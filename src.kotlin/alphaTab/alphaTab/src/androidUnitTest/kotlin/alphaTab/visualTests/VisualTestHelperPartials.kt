package alphaTab.visualTests

import alphaTab.alphaSkia.AlphaSkiaLinux
import alphaTab.alphaSkia.AlphaSkiaMacOs
import alphaTab.alphaSkia.AlphaSkiaWindows

actual class VisualTestHelperPartials {
    actual companion object {
        actual suspend fun enableAlphaSkia(bravura: alphaTab.core.ecmaScript.ArrayBuffer) {
            val os = System.getProperty("os.name")
            when {
                os == "Mac OS X" -> {
                    alphaTab.alphaSkia.AlphaSkiaPlatform.loadLibrary(AlphaSkiaMacOs::class.java)
                }

                os.startsWith("Win") -> {
                    alphaTab.alphaSkia.AlphaSkiaPlatform.loadLibrary(AlphaSkiaWindows::class.java)
                }

                os.startsWith("Linux") -> {
                    alphaTab.alphaSkia.AlphaSkiaPlatform.loadLibrary(AlphaSkiaLinux::class.java)
                }

                else -> {
                    throw Error("Unsupported OS: $os")
                }
            }
        }
    }
}
