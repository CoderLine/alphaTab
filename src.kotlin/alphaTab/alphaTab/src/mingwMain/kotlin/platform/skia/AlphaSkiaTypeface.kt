package alphaTab.platform.skia

actual class AlphaSkiaTypeface private constructor(internal val typeface: alphaTab.alphaSkia.AlphaSkiaTypeface) :
    AutoCloseable {
    actual companion object {
        actual fun create(family: String, isBold: Boolean, isItalic: Boolean): AlphaSkiaTypeface? {
            val inner = alphaTab.alphaSkia.AlphaSkiaTypeface.create(family, isBold, isItalic)
            return if (inner == null) null else AlphaSkiaTypeface(inner)
        }

        @ExperimentalUnsignedTypes
        actual fun register(data: alphaTab.core.ecmaScript.ArrayBuffer): AlphaSkiaTypeface? {
            val inner = alphaTab.alphaSkia.AlphaSkiaTypeface.register(data.asByteArray())
            return if (inner == null) null else AlphaSkiaTypeface(inner)
        }
    }

    actual val familyName: String
        get() = this.typeface.familyName

    actual val isItalic: Boolean
        get() = this.typeface.italic

    actual val isBold: Boolean
        get() = this.typeface.bold

    override fun close() {
        this.typeface.close()
    }
}
