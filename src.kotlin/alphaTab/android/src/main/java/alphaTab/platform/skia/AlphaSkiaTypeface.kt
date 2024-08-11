package alphaTab.platform.skia

class AlphaSkiaTypeface private constructor(internal val typeface: alphaTab.alphaSkia.AlphaSkiaTypeface) :
    AutoCloseable {
    companion object {
        fun create(family: String, isBold: Boolean, isItalic: Boolean): AlphaSkiaTypeface? {
            val inner = alphaTab.alphaSkia.AlphaSkiaTypeface.create(family, isBold, isItalic)
            return if (inner == null) null else AlphaSkiaTypeface(inner)
        }

        @ExperimentalUnsignedTypes
        fun register(data: alphaTab.core.ecmaScript.ArrayBuffer): AlphaSkiaTypeface? {
            val inner = alphaTab.alphaSkia.AlphaSkiaTypeface.register(data.asByteArray())
            return if (inner == null) null else AlphaSkiaTypeface(inner)
        }
    }

    val familyName: String
        get() = this.typeface.familyName

    val isItalic: Boolean
        get() = this.typeface.isItalic

    val isBold: Boolean
        get() = this.typeface.isBold

    override fun close() {
        this.typeface.close()
    }
}
