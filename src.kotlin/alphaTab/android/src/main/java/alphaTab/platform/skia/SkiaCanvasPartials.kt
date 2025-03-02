package alphaTab.platform.skia

import kotlin.contracts.ExperimentalContracts

class SkiaCanvasPartials {
    companion object {
        @Suppress("UNUSED_PARAMETER")
        @ExperimentalContracts
        @ExperimentalUnsignedTypes
        fun enable(musicFontData: alphaTab.core.ecmaScript.ArrayBuffer, alphaSkia: Any?) {
            SkiaCanvas.initializeMusicFont(AlphaSkiaTypeface.register(musicFontData)!!)
        }
    }
}
