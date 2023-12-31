package alphaTab.platform.skia

expect class AlphaSkiaTypeface : AutoCloseable {
    companion object {
        fun create(family: String, isBold: Boolean, isItalic: Boolean): AlphaSkiaTypeface?
        @ExperimentalUnsignedTypes
        fun register(data: alphaTab.core.ecmaScript.ArrayBuffer): AlphaSkiaTypeface?
    }

    val familyName: String
    val isItalic: Boolean
    val isBold: Boolean
}
