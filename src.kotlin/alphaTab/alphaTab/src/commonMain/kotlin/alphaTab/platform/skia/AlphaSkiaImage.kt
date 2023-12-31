package alphaTab.platform.skia

import alphaTab.core.ecmaScript.ArrayBuffer

@ExperimentalUnsignedTypes
expect class AlphaSkiaImage : AutoCloseable {
    companion object {
        fun decode(data: ArrayBuffer): AlphaSkiaImage?
        fun fromPixels(width: Double, height: Double, pixels: ArrayBuffer): AlphaSkiaImage?
    }
    val width: Double
    val height: Double
    fun readPixels(): ArrayBuffer?
    fun toPng(): ArrayBuffer?
}
