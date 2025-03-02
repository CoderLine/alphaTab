package alphaTab.platform.skia

import alphaTab.core.ecmaScript.ArrayBuffer

@ExperimentalUnsignedTypes
class AlphaSkiaImage internal constructor(internal val image: alphaTab.alphaSkia.AlphaSkiaImage) :
    AutoCloseable {
    companion object {
        fun decode(data: ArrayBuffer): AlphaSkiaImage? {
            val inner = alphaTab.alphaSkia.AlphaSkiaImage.decode(data.asByteArray())
            return if (inner == null) null else AlphaSkiaImage(inner)
        }

        fun fromPixels(width: Double, height: Double, pixels: ArrayBuffer): AlphaSkiaImage? {
            val inner = alphaTab.alphaSkia.AlphaSkiaImage.fromPixels(
                width.toInt(),
                height.toInt(),
                pixels.asByteArray()
            )
            return if (inner == null) null else AlphaSkiaImage(inner)
        }
    }

    val width: Double
        get() = this.image.width.toDouble()

    val height: Double
        get() = this.image.height.toDouble()

    override fun close() {
        this.image.close()
    }

    fun readPixels(): ArrayBuffer? {
        return this.image.readPixels()?.asUByteArray()
    }

    fun toPng(): ArrayBuffer? {
        return this.image.toPng()?.asUByteArray()
    }
}
